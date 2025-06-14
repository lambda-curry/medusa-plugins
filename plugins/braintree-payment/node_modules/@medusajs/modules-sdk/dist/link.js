"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = void 0;
const utils_1 = require("@medusajs/utils");
const medusa_module_1 = require("./medusa-module");
const convert_data_to_link_definition_1 = require("./utils/convert-data-to-link-definition");
const linking_error_1 = require("./utils/linking-error");
class Link {
    constructor(modulesLoaded) {
        this.modulesMap = new Map();
        this.relationsPairs = new Map();
        this.relations = new Map();
        if (!modulesLoaded?.length) {
            modulesLoaded = medusa_module_1.MedusaModule.getLoadedModules().map((mod) => Object.values(mod)[0]);
        }
        for (const mod of modulesLoaded || []) {
            this.addModule(mod);
        }
    }
    addModule(mod) {
        if (!mod.__definition.isQueryable || mod.__joinerConfig.isReadOnlyLink) {
            return;
        }
        const joinerConfig = mod.__joinerConfig;
        const serviceName = joinerConfig.isLink
            ? joinerConfig.serviceName
            : mod.__definition.key;
        if (this.modulesMap.has(serviceName)) {
            throw new Error(`Duplicated instance of module ${serviceName} is not allowed.`);
        }
        if (joinerConfig.relationships?.length) {
            if (joinerConfig.isLink) {
                const [primary, foreign] = joinerConfig.relationships;
                const key = [
                    primary.serviceName,
                    primary.foreignKey,
                    foreign.serviceName,
                    foreign.foreignKey,
                ].join("-");
                this.relationsPairs.set(key, mod);
            }
            for (const relationship of joinerConfig.relationships) {
                if (joinerConfig.isLink && !relationship.deleteCascade) {
                    continue;
                }
                this.addRelationship(serviceName, {
                    ...relationship,
                    isPrimary: false,
                    isForeign: true,
                });
            }
        }
        if (joinerConfig.extends?.length) {
            for (const service of joinerConfig.extends) {
                const relationship = service.relationship;
                this.addRelationship(service.serviceName, {
                    ...relationship,
                    serviceName: serviceName,
                    isPrimary: true,
                    isForeign: false,
                });
            }
        }
        this.modulesMap.set(serviceName, mod);
    }
    addRelationship(serviceName, relationship) {
        const { primaryKey, foreignKey } = relationship;
        if (!this.relations.has(serviceName)) {
            this.relations.set(serviceName, new Map());
        }
        const key = relationship.isPrimary ? primaryKey : foreignKey;
        const serviceMap = this.relations.get(serviceName);
        if (!serviceMap.has(key)) {
            serviceMap.set(key, []);
        }
        serviceMap.get(key).push(relationship);
    }
    getLinkModule(moduleA, moduleAKey, moduleB, moduleBKey) {
        const key = [moduleA, moduleAKey, moduleB, moduleBKey].join("-");
        return this.relationsPairs.get(key);
    }
    getRelationships() {
        return this.relations;
    }
    getLinkableKeys(mod) {
        return ((mod.__joinerConfig.linkableKeys &&
            Object.keys(mod.__joinerConfig.linkableKeys)) ||
            mod.__joinerConfig.primaryKeys ||
            []);
    }
    async executeCascade(removedServices, executionMethod, sharedContext = {}) {
        const removedIds = {};
        const returnIdsList = {};
        const processedIds = {};
        const services = Object.keys(removedServices).map((serviceName) => {
            const deleteKeys = {};
            for (const field in removedServices[serviceName]) {
                deleteKeys[field] = Array.isArray(removedServices[serviceName][field])
                    ? removedServices[serviceName][field]
                    : [removedServices[serviceName][field]];
            }
            return { serviceName, deleteKeys };
        });
        const errors = [];
        const cascade = async (services, isCascading = false) => {
            let method = executionMethod;
            if (errors.length) {
                return returnIdsList;
            }
            const servicePromises = services.map(async (serviceInfo) => {
                const serviceRelations = this.relations.get(serviceInfo.serviceName);
                if (!serviceRelations) {
                    return;
                }
                const values = serviceInfo.deleteKeys;
                const deletePromises = [];
                for (const field in values) {
                    const relatedServices = serviceRelations.get(field);
                    if (!relatedServices || !values[field]?.length) {
                        continue;
                    }
                    const relatedServicesPromises = relatedServices.map(async (relatedService) => {
                        const { serviceName, primaryKey, args } = relatedService;
                        const processedHash = `${serviceName}-${primaryKey}`;
                        if (!processedIds[processedHash]) {
                            processedIds[processedHash] = new Set();
                        }
                        const unprocessedIds = values[field].filter((id) => !processedIds[processedHash].has(id));
                        if (!unprocessedIds.length) {
                            return;
                        }
                        unprocessedIds.forEach((id) => {
                            processedIds[processedHash].add(id);
                        });
                        let cascadeDelKeys = {};
                        cascadeDelKeys[primaryKey] = unprocessedIds;
                        const service = this.modulesMap.get(serviceName);
                        const returnFields = this.getLinkableKeys(service);
                        let deletedEntities = {};
                        try {
                            if (args?.methodSuffix) {
                                method += (0, utils_1.toPascalCase)(args.methodSuffix);
                            }
                            const removed = await service[method](cascadeDelKeys, {
                                returnLinkableKeys: returnFields,
                            }, sharedContext);
                            deletedEntities = removed;
                        }
                        catch (error) {
                            errors.push({
                                serviceName,
                                method,
                                args: cascadeDelKeys,
                                error: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
                            });
                            return;
                        }
                        if (Object.keys(deletedEntities).length === 0) {
                            return;
                        }
                        removedIds[serviceName] = {
                            ...deletedEntities,
                        };
                        if (!isCascading) {
                            returnIdsList[serviceName] = {
                                ...deletedEntities,
                            };
                        }
                        else {
                            const [mainKey] = returnFields;
                            if (!returnIdsList[serviceName]) {
                                returnIdsList[serviceName] = {};
                            }
                            if (!returnIdsList[serviceName][mainKey]) {
                                returnIdsList[serviceName][mainKey] = [];
                            }
                            returnIdsList[serviceName][mainKey] = [
                                ...new Set(returnIdsList[serviceName][mainKey].concat(deletedEntities[mainKey])),
                            ];
                        }
                        Object.keys(deletedEntities).forEach((key) => {
                            deletedEntities[key].forEach((id) => {
                                const hash = `${serviceName}-${key}`;
                                if (!processedIds[hash]) {
                                    processedIds[hash] = new Set();
                                }
                                processedIds[hash].add(id);
                            });
                        });
                        await cascade([
                            {
                                serviceName: serviceName,
                                deleteKeys: deletedEntities,
                            },
                        ], true);
                    });
                    deletePromises.push(...relatedServicesPromises);
                }
                await (0, utils_1.promiseAll)(deletePromises);
            });
            await (0, utils_1.promiseAll)(servicePromises);
            return returnIdsList;
        };
        const result = await cascade(services);
        return [errors.length ? errors : null, result];
    }
    getLinkModuleOrThrow(link) {
        const mods = Object.keys(link).filter((attr) => attr !== "data");
        if (mods.length > 2) {
            throw new Error(`Only two modules can be linked.`);
        }
        const { moduleA, moduleB, moduleAKey, moduleBKey } = this.getLinkDataConfig(link);
        const service = this.getLinkModule(moduleA, moduleAKey, moduleB, moduleBKey);
        if (!service) {
            throw new Error((0, linking_error_1.linkingErrorMessage)({
                moduleA,
                moduleAKey,
                moduleB,
                moduleBKey,
                type: "link",
            }));
        }
        return service;
    }
    getLinkDataConfig(link) {
        const moduleNames = Object.keys(link).filter((attr) => attr !== "data");
        const [moduleA, moduleB] = moduleNames;
        const primaryKeys = Object.keys(link[moduleA]);
        const moduleAKey = primaryKeys.join(",");
        const moduleBKey = Object.keys(link[moduleB]).join(",");
        return {
            moduleA,
            moduleB,
            primaryKeys,
            moduleAKey,
            moduleBKey,
        };
    }
    async create(link, sharedContext = {}) {
        const allLinks = Array.isArray(link) ? link : [link];
        const serviceLinks = new Map();
        for (const link of allLinks) {
            const service = this.getLinkModuleOrThrow(link);
            const relationships = service.__joinerConfig.relationships;
            const { moduleA, moduleB, moduleBKey, primaryKeys } = this.getLinkDataConfig(link);
            if (!serviceLinks.has(service.__definition.key)) {
                serviceLinks.set(service.__definition.key, {
                    /**
                     * Tuple of foreign key and the primary keys that must be
                     * persisted to the pivot table for representing the
                     * link
                     */
                    linksToCreate: [],
                    /**
                     * An array of objects to validate for uniqueness before persisting
                     * data to the pivot table. When a link uses "isList: false", we
                     * have to limit a relationship with this entity to be a one-to-one
                     * or one-to-many
                     */
                    linksToValidateForUniqueness: {
                        filters: [],
                        services: relationships?.map((r) => r.serviceName) ?? [],
                    },
                });
            }
            /**
             * When isList is set on false on the relationship, then it means
             * we have a one-to-one or many-to-one relationship with the
             * other side and we have limit duplicate entries from other
             * entity. For example:
             *
             * - A brand has a many to one relationship with a product.
             * - A product can have only one brand. Aka (brand.isList = false)
             * - A brand can have multiple products. Aka (products.isList = true)
             *
             * A result of this, we have to ensure that a product_id can only appear
             * once in the pivot table that is used for tracking "brand<>products"
             * relationship.
             */
            const linksToValidateForUniqueness = serviceLinks.get(service.__definition.key).linksToValidateForUniqueness;
            const modA = relationships?.[0];
            const modB = relationships?.[1];
            if (!modA.hasMany || !modB.hasMany) {
                if (!modA.hasMany && !modB.hasMany) {
                    linksToValidateForUniqueness.filters.push({
                        $or: [
                            { [modA.foreignKey]: link[moduleA][modA.foreignKey] },
                            { [modB.foreignKey]: link[moduleB][modB.foreignKey] },
                        ],
                    });
                }
                else if (!modA.hasMany) {
                    linksToValidateForUniqueness.filters.push({
                        [modA.foreignKey]: { $ne: link[moduleA][modA.foreignKey] },
                        [modB.foreignKey]: link[moduleB][modB.foreignKey],
                    });
                }
                else if (!modB.hasMany) {
                    linksToValidateForUniqueness.filters.push({
                        [modB.foreignKey]: { $ne: link[moduleB][modB.foreignKey] },
                        [modA.foreignKey]: link[moduleA][modA.foreignKey],
                    });
                }
            }
            const pkValue = primaryKeys.length === 1
                ? link[moduleA][primaryKeys[0]]
                : primaryKeys.map((k) => link[moduleA][k]);
            const fields = [pkValue, link[moduleB][moduleBKey]];
            if ((0, utils_1.isObject)(link.data)) {
                fields.push(link.data);
            }
            serviceLinks
                .get(service.__definition.key)
                ?.linksToCreate.push(fields);
        }
        for (const [serviceName, data] of serviceLinks) {
            if (data.linksToValidateForUniqueness.filters.length) {
                const service = this.modulesMap.get(serviceName);
                const existingLinks = await service.list({
                    $or: data.linksToValidateForUniqueness.filters,
                }, {
                    take: 1,
                }, sharedContext);
                if (existingLinks.length > 0) {
                    const serviceA = data.linksToValidateForUniqueness.services[0];
                    const serviceB = data.linksToValidateForUniqueness.services[1];
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot create multiple links between '${serviceA}' and '${serviceB}'`);
                }
            }
        }
        const promises = [];
        for (const [serviceName, data] of serviceLinks) {
            const service = this.modulesMap.get(serviceName);
            promises.push(service.create(data.linksToCreate, undefined, undefined, sharedContext));
        }
        return (await (0, utils_1.promiseAll)(promises)).flat();
    }
    async dismiss(link, sharedContext = {}) {
        const allLinks = Array.isArray(link) ? link : [link];
        const serviceLinks = new Map();
        for (const link of allLinks) {
            const service = this.getLinkModuleOrThrow(link);
            const { moduleA, moduleB, moduleBKey, primaryKeys } = this.getLinkDataConfig(link);
            if (!serviceLinks.has(service.__definition.key)) {
                serviceLinks.set(service.__definition.key, []);
            }
            const pkValue = primaryKeys.length === 1
                ? link[moduleA][primaryKeys[0]]
                : primaryKeys.map((k) => link[moduleA][k]);
            serviceLinks
                .get(service.__definition.key)
                ?.push([pkValue, link[moduleB][moduleBKey]]);
        }
        const promises = [];
        for (const [serviceName, links] of serviceLinks) {
            const service = this.modulesMap.get(serviceName);
            promises.push(service.dismiss(links, undefined, sharedContext));
        }
        return (await (0, utils_1.promiseAll)(promises)).flat();
    }
    async delete(removedServices, sharedContext = {}) {
        return await this.executeCascade(removedServices, "softDelete", sharedContext);
    }
    async restore(removedServices, sharedContext = {}) {
        return await this.executeCascade(removedServices, "restore", sharedContext);
    }
    async list(link, options, sharedContext = {}) {
        const allLinks = Array.isArray(link) ? link : [link];
        const serviceLinks = new Map();
        for (const link of allLinks) {
            const service = this.getLinkModuleOrThrow(link);
            const { moduleA, moduleB } = this.getLinkDataConfig(link);
            if (!serviceLinks.has(service.__definition.key)) {
                serviceLinks.set(service.__definition.key, []);
            }
            serviceLinks.get(service.__definition.key)?.push({
                ...link[moduleA],
                ...link[moduleB],
            });
        }
        const promises = [];
        for (const [serviceName, filters] of serviceLinks) {
            const service = this.modulesMap.get(serviceName);
            promises.push(service
                .list({ $or: filters }, {}, sharedContext)
                .then((links) => options?.asLinkDefinition
                ? (0, convert_data_to_link_definition_1.convertRecordsToLinkDefinition)(links, service)
                : links));
        }
        return (await (0, utils_1.promiseAll)(promises)).flat();
    }
}
exports.Link = Link;
// To not lose the context chain, we need to set the type to MedusaModuleType
Link.__type = utils_1.MedusaModuleType;
__decorate([
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], Link.prototype, "executeCascade", null);
__decorate([
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Link.prototype, "create", null);
__decorate([
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Link.prototype, "dismiss", null);
__decorate([
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Link.prototype, "delete", null);
__decorate([
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Link.prototype, "restore", null);
__decorate([
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], Link.prototype, "list", null);
//# sourceMappingURL=link.js.map