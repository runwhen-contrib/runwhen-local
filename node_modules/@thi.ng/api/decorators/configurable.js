/**
 * Property decorator factory. Sets `configurable` flag of PropertyDescriptor
 * to given state.
 *
 * @param state - true, if propoerty is configurable
 */
export const configurable = (state) => function (_, __, descriptor) {
    descriptor.configurable = state;
};
