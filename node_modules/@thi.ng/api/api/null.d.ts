export declare type Nullable<T> = T | null | undefined;
/**
 * Similar to `NonNullable`, but only excludes `undefined`.
 */
export declare type Always<T> = T extends undefined ? never : T;
//# sourceMappingURL=null.d.ts.map