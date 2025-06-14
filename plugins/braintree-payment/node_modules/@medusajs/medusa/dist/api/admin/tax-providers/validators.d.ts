import { z } from "zod";
export declare const AdminGetTaxProvidersParamsFields: z.ZodObject<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    is_enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id?: string | string[] | undefined;
    is_enabled?: boolean | undefined;
}, {
    id?: string | string[] | undefined;
    is_enabled?: boolean | undefined;
}>;
export type AdminGetTaxProvidersParamsFieldsType = z.infer<typeof AdminGetTaxProvidersParamsFields>;
export type AdminGetTaxProvidersParamsType = z.infer<typeof AdminGetTaxProvidersParams>;
export declare const AdminGetTaxProvidersParams: z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
    $or: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map