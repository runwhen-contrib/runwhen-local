/**
 * Method property decorator. Sets `configurable` flag of
 * PropertyDescriptor to `false` (same as `@configurable(false)`).
 * Intended to be used in combination with mixin decorators to enable
 * partial implementations of mixed-in behaviors in target class and
 * avoid them being overidden by mixed-in behaviour.
 */
export declare const nomixin: (_: any, __: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=nomixin.d.ts.map