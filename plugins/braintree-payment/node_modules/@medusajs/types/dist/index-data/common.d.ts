import { ModuleJoinerConfig } from "../modules-sdk";
export type SchemaObjectEntityRepresentation = {
    /**
     * The name of the type/entity in the schema
     */
    entity: string;
    /**
     * All parents a type/entity refers to in the schema
     * or through links
     */
    parents: {
        /**
         * The reference to the schema object representation
         * of the parent
         */
        ref: SchemaObjectEntityRepresentation;
        /**
         * When a link is inferred between two types/entities
         * we are configuring the link tree, and therefore we are
         * storing the reference to the parent type/entity within the
         * schema which defer from the true parent from a pure entity
         * point of view
         */
        inSchemaRef?: SchemaObjectEntityRepresentation;
        /**
         * The property the data should be assigned to in the parent
         */
        targetProp: string;
        /**
         * The property the parent is assigned to in my side
         */
        inverseSideProp: string;
        /**
         * Are the data expected to be a list or not
         */
        isList?: boolean;
        /**
         * Whether the entity is the inverse of the link (not the owner.):
         * e.g: order -> cart, order is the owner, cart is the inverse
         */
        isInverse?: boolean;
    }[];
    /**
     * The default fields to query for the type/entity
     */
    fields: string[];
    /**
     * `@Listerners` directive is required and all listeners found
     * for the type will be stored here
     */
    listeners: string[];
    /**
     * The alias for the type/entity retrieved in the corresponding
     * module
     */
    alias: string;
    /**
     * The module joiner config corresponding to the module the type/entity
     * refers to
     */
    moduleConfig: ModuleJoinerConfig;
};
export type EntityNameModuleConfigMap = {
    [key: string]: ModuleJoinerConfig;
};
export type SchemaPropertiesMap = {
    [key: string]: {
        shortCutOf?: string;
        ref: SchemaObjectEntityRepresentation;
        isInverse?: boolean;
        isList?: boolean;
    };
};
/**
 * Represents the schema objects representation once the schema has been processed
 */
export type SchemaObjectRepresentation = {
    [key: string]: SchemaObjectEntityRepresentation;
} | {
    _schemaPropertiesMap: SchemaPropertiesMap;
    _serviceNameModuleConfigMap: EntityNameModuleConfigMap;
};
//# sourceMappingURL=common.d.ts.map