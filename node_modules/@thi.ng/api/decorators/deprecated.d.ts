/**
 * Method property decorator factory. Augments original method with
 * deprecation message (via console), shown when method is invoked.
 * Accepts optional message arg. Throws error if assigned property
 * is not a function.
 *
 * @param msg - deprecation message
 */
export declare const deprecated: (msg?: string | undefined, log?: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}) => MethodDecorator;
//# sourceMappingURL=deprecated.d.ts.map