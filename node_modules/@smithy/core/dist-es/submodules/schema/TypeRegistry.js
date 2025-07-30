export class TypeRegistry {
    constructor(namespace, schemas = new Map()) {
        this.namespace = namespace;
        this.schemas = schemas;
    }
    static for(namespace) {
        if (!TypeRegistry.registries.has(namespace)) {
            TypeRegistry.registries.set(namespace, new TypeRegistry(namespace));
        }
        return TypeRegistry.registries.get(namespace);
    }
    register(shapeId, schema) {
        const qualifiedName = this.normalizeShapeId(shapeId);
        const registry = TypeRegistry.for(this.getNamespace(shapeId));
        registry.schemas.set(qualifiedName, schema);
    }
    getSchema(shapeId) {
        const id = this.normalizeShapeId(shapeId);
        if (!this.schemas.has(id)) {
            throw new Error(`@smithy/core/schema - schema not found for ${id}`);
        }
        return this.schemas.get(id);
    }
    getBaseException() {
        for (const [id, schema] of this.schemas.entries()) {
            if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) {
                return schema;
            }
        }
        return undefined;
    }
    find(predicate) {
        return [...this.schemas.values()].find(predicate);
    }
    destroy() {
        TypeRegistry.registries.delete(this.namespace);
        this.schemas.clear();
    }
    normalizeShapeId(shapeId) {
        if (shapeId.includes("#")) {
            return shapeId;
        }
        return this.namespace + "#" + shapeId;
    }
    getNamespace(shapeId) {
        return this.normalizeShapeId(shapeId).split("#")[0];
    }
}
TypeRegistry.registries = new Map();
