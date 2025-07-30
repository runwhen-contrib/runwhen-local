var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/submodules/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  ErrorSchema: () => ErrorSchema,
  ListSchema: () => ListSchema,
  MapSchema: () => MapSchema,
  NormalizedSchema: () => NormalizedSchema,
  OperationSchema: () => OperationSchema,
  SCHEMA: () => SCHEMA,
  Schema: () => Schema,
  SimpleSchema: () => SimpleSchema,
  StructureSchema: () => StructureSchema,
  TypeRegistry: () => TypeRegistry,
  deref: () => deref,
  deserializerMiddlewareOption: () => deserializerMiddlewareOption,
  error: () => error,
  getSchemaSerdePlugin: () => getSchemaSerdePlugin,
  list: () => list,
  map: () => map,
  op: () => op,
  serializerMiddlewareOption: () => serializerMiddlewareOption,
  sim: () => sim,
  struct: () => struct
});
module.exports = __toCommonJS(schema_exports);

// src/submodules/schema/deref.ts
var deref = (schemaRef) => {
  if (typeof schemaRef === "function") {
    return schemaRef();
  }
  return schemaRef;
};

// src/submodules/schema/middleware/schemaDeserializationMiddleware.ts
var import_protocol_http = require("@smithy/protocol-http");
var import_util_middleware = require("@smithy/util-middleware");
var schemaDeserializationMiddleware = (config) => (next, context) => async (args) => {
  const { response } = await next(args);
  const { operationSchema } = (0, import_util_middleware.getSmithyContext)(context);
  try {
    const parsed = await config.protocol.deserializeResponse(
      operationSchema,
      {
        ...config,
        ...context
      },
      response
    );
    return {
      response,
      output: parsed
    };
  } catch (error2) {
    Object.defineProperty(error2, "$response", {
      value: response
    });
    if (!("$metadata" in error2)) {
      const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
      try {
        error2.message += "\n  " + hint;
      } catch (e) {
        if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") {
          console.warn(hint);
        } else {
          context.logger?.warn?.(hint);
        }
      }
      if (typeof error2.$responseBodyText !== "undefined") {
        if (error2.$response) {
          error2.$response.body = error2.$responseBodyText;
        }
      }
      try {
        if (import_protocol_http.HttpResponse.isInstance(response)) {
          const { headers = {} } = response;
          const headerEntries = Object.entries(headers);
          error2.$metadata = {
            httpStatusCode: response.statusCode,
            requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
            extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
            cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
          };
        }
      } catch (e) {
      }
    }
    throw error2;
  }
};
var findHeader = (pattern, headers) => {
  return (headers.find(([k]) => {
    return k.match(pattern);
  }) || [void 0, void 0])[1];
};

// src/submodules/schema/middleware/schemaSerializationMiddleware.ts
var import_util_middleware2 = require("@smithy/util-middleware");
var schemaSerializationMiddleware = (config) => (next, context) => async (args) => {
  const { operationSchema } = (0, import_util_middleware2.getSmithyContext)(context);
  const endpoint = context.endpointV2?.url && config.urlParser ? async () => config.urlParser(context.endpointV2.url) : config.endpoint;
  const request = await config.protocol.serializeRequest(operationSchema, args.input, {
    ...config,
    ...context,
    endpoint
  });
  return next({
    ...args,
    request
  });
};

// src/submodules/schema/middleware/getSchemaSerdePlugin.ts
var deserializerMiddlewareOption = {
  name: "deserializerMiddleware",
  step: "deserialize",
  tags: ["DESERIALIZER"],
  override: true
};
var serializerMiddlewareOption = {
  name: "serializerMiddleware",
  step: "serialize",
  tags: ["SERIALIZER"],
  override: true
};
function getSchemaSerdePlugin(config) {
  return {
    applyToStack: (commandStack) => {
      commandStack.add(schemaSerializationMiddleware(config), serializerMiddlewareOption);
      commandStack.add(schemaDeserializationMiddleware(config), deserializerMiddlewareOption);
      config.protocol.setSerdeContext(config);
    }
  };
}

// src/submodules/schema/TypeRegistry.ts
var TypeRegistry = class _TypeRegistry {
  constructor(namespace, schemas = /* @__PURE__ */ new Map()) {
    this.namespace = namespace;
    this.schemas = schemas;
  }
  static {
    this.registries = /* @__PURE__ */ new Map();
  }
  /**
   * @param namespace - specifier.
   * @returns the schema for that namespace, creating it if necessary.
   */
  static for(namespace) {
    if (!_TypeRegistry.registries.has(namespace)) {
      _TypeRegistry.registries.set(namespace, new _TypeRegistry(namespace));
    }
    return _TypeRegistry.registries.get(namespace);
  }
  /**
   * Adds the given schema to a type registry with the same namespace.
   *
   * @param shapeId - to be registered.
   * @param schema - to be registered.
   */
  register(shapeId, schema) {
    const qualifiedName = this.normalizeShapeId(shapeId);
    const registry = _TypeRegistry.for(this.getNamespace(shapeId));
    registry.schemas.set(qualifiedName, schema);
  }
  /**
   * @param shapeId - query.
   * @returns the schema.
   */
  getSchema(shapeId) {
    const id = this.normalizeShapeId(shapeId);
    if (!this.schemas.has(id)) {
      throw new Error(`@smithy/core/schema - schema not found for ${id}`);
    }
    return this.schemas.get(id);
  }
  /**
   * The smithy-typescript code generator generates a synthetic (i.e. unmodeled) base exception,
   * because generated SDKs before the introduction of schemas have the notion of a ServiceBaseException, which
   * is unique per service/model.
   *
   * This is generated under a unique prefix that is combined with the service namespace, and this
   * method is used to retrieve it.
   *
   * The base exception synthetic schema is used when an error is returned by a service, but we cannot
   * determine what existing schema to use to deserialize it.
   *
   * @returns the synthetic base exception of the service namespace associated with this registry instance.
   */
  getBaseException() {
    for (const [id, schema] of this.schemas.entries()) {
      if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) {
        return schema;
      }
    }
    return void 0;
  }
  /**
   * @param predicate - criterion.
   * @returns a schema in this registry matching the predicate.
   */
  find(predicate) {
    return [...this.schemas.values()].find(predicate);
  }
  /**
   * Unloads the current TypeRegistry.
   */
  destroy() {
    _TypeRegistry.registries.delete(this.namespace);
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
};

// src/submodules/schema/schemas/Schema.ts
var Schema = class {
  constructor(name, traits) {
    this.name = name;
    this.traits = traits;
  }
};

// src/submodules/schema/schemas/ListSchema.ts
var ListSchema = class _ListSchema extends Schema {
  constructor(name, traits, valueSchema) {
    super(name, traits);
    this.name = name;
    this.traits = traits;
    this.valueSchema = valueSchema;
    this.symbol = _ListSchema.symbol;
  }
  static {
    this.symbol = Symbol.for("@smithy/core/schema::ListSchema");
  }
  static [Symbol.hasInstance](lhs) {
    const isPrototype = _ListSchema.prototype.isPrototypeOf(lhs);
    if (!isPrototype && typeof lhs === "object" && lhs !== null) {
      const list2 = lhs;
      return list2.symbol === _ListSchema.symbol;
    }
    return isPrototype;
  }
};
function list(namespace, name, traits = {}, valueSchema) {
  const schema = new ListSchema(
    namespace + "#" + name,
    traits,
    typeof valueSchema === "function" ? valueSchema() : valueSchema
  );
  TypeRegistry.for(namespace).register(name, schema);
  return schema;
}

// src/submodules/schema/schemas/MapSchema.ts
var MapSchema = class _MapSchema extends Schema {
  constructor(name, traits, keySchema, valueSchema) {
    super(name, traits);
    this.name = name;
    this.traits = traits;
    this.keySchema = keySchema;
    this.valueSchema = valueSchema;
    this.symbol = _MapSchema.symbol;
  }
  static {
    this.symbol = Symbol.for("@smithy/core/schema::MapSchema");
  }
  static [Symbol.hasInstance](lhs) {
    const isPrototype = _MapSchema.prototype.isPrototypeOf(lhs);
    if (!isPrototype && typeof lhs === "object" && lhs !== null) {
      const map2 = lhs;
      return map2.symbol === _MapSchema.symbol;
    }
    return isPrototype;
  }
};
function map(namespace, name, traits = {}, keySchema, valueSchema) {
  const schema = new MapSchema(
    namespace + "#" + name,
    traits,
    keySchema,
    typeof valueSchema === "function" ? valueSchema() : valueSchema
  );
  TypeRegistry.for(namespace).register(name, schema);
  return schema;
}

// src/submodules/schema/schemas/OperationSchema.ts
var OperationSchema = class extends Schema {
  constructor(name, traits, input, output) {
    super(name, traits);
    this.name = name;
    this.traits = traits;
    this.input = input;
    this.output = output;
  }
};
function op(namespace, name, traits = {}, input, output) {
  const schema = new OperationSchema(namespace + "#" + name, traits, input, output);
  TypeRegistry.for(namespace).register(name, schema);
  return schema;
}

// src/submodules/schema/schemas/StructureSchema.ts
var StructureSchema = class _StructureSchema extends Schema {
  constructor(name, traits, memberNames, memberList) {
    super(name, traits);
    this.name = name;
    this.traits = traits;
    this.memberNames = memberNames;
    this.memberList = memberList;
    this.symbol = _StructureSchema.symbol;
    this.members = {};
    for (let i = 0; i < memberNames.length; ++i) {
      this.members[memberNames[i]] = Array.isArray(memberList[i]) ? memberList[i] : [memberList[i], 0];
    }
  }
  static {
    this.symbol = Symbol.for("@smithy/core/schema::StructureSchema");
  }
  static [Symbol.hasInstance](lhs) {
    const isPrototype = _StructureSchema.prototype.isPrototypeOf(lhs);
    if (!isPrototype && typeof lhs === "object" && lhs !== null) {
      const struct2 = lhs;
      return struct2.symbol === _StructureSchema.symbol;
    }
    return isPrototype;
  }
};
function struct(namespace, name, traits, memberNames, memberList) {
  const schema = new StructureSchema(namespace + "#" + name, traits, memberNames, memberList);
  TypeRegistry.for(namespace).register(name, schema);
  return schema;
}

// src/submodules/schema/schemas/ErrorSchema.ts
var ErrorSchema = class _ErrorSchema extends StructureSchema {
  constructor(name, traits, memberNames, memberList, ctor) {
    super(name, traits, memberNames, memberList);
    this.name = name;
    this.traits = traits;
    this.memberNames = memberNames;
    this.memberList = memberList;
    this.ctor = ctor;
    this.symbol = _ErrorSchema.symbol;
  }
  static {
    this.symbol = Symbol.for("@smithy/core/schema::ErrorSchema");
  }
  static [Symbol.hasInstance](lhs) {
    const isPrototype = _ErrorSchema.prototype.isPrototypeOf(lhs);
    if (!isPrototype && typeof lhs === "object" && lhs !== null) {
      const err = lhs;
      return err.symbol === _ErrorSchema.symbol;
    }
    return isPrototype;
  }
};
function error(namespace, name, traits = {}, memberNames, memberList, ctor) {
  const schema = new ErrorSchema(namespace + "#" + name, traits, memberNames, memberList, ctor);
  TypeRegistry.for(namespace).register(name, schema);
  return schema;
}

// src/submodules/schema/schemas/sentinels.ts
var SCHEMA = {
  BLOB: 21,
  // 21
  STREAMING_BLOB: 42,
  // 42
  BOOLEAN: 2,
  // 2
  STRING: 0,
  // 0
  NUMERIC: 1,
  // 1
  BIG_INTEGER: 17,
  // 17
  BIG_DECIMAL: 19,
  // 19
  DOCUMENT: 15,
  // 15
  TIMESTAMP_DEFAULT: 4,
  // 4
  TIMESTAMP_DATE_TIME: 5,
  // 5
  TIMESTAMP_HTTP_DATE: 6,
  // 6
  TIMESTAMP_EPOCH_SECONDS: 7,
  // 7
  LIST_MODIFIER: 64,
  // 64
  MAP_MODIFIER: 128
  // 128
};

// src/submodules/schema/schemas/SimpleSchema.ts
var SimpleSchema = class _SimpleSchema extends Schema {
  constructor(name, schemaRef, traits) {
    super(name, traits);
    this.name = name;
    this.schemaRef = schemaRef;
    this.traits = traits;
    this.symbol = _SimpleSchema.symbol;
  }
  static {
    this.symbol = Symbol.for("@smithy/core/schema::SimpleSchema");
  }
  static [Symbol.hasInstance](lhs) {
    const isPrototype = _SimpleSchema.prototype.isPrototypeOf(lhs);
    if (!isPrototype && typeof lhs === "object" && lhs !== null) {
      const sim2 = lhs;
      return sim2.symbol === _SimpleSchema.symbol;
    }
    return isPrototype;
  }
};
function sim(namespace, name, schemaRef, traits) {
  const schema = new SimpleSchema(namespace + "#" + name, schemaRef, traits);
  TypeRegistry.for(namespace).register(name, schema);
  return schema;
}

// src/submodules/schema/schemas/NormalizedSchema.ts
var NormalizedSchema = class _NormalizedSchema {
  /**
   * @param ref - a polymorphic SchemaRef to be dereferenced/normalized.
   * @param memberName - optional memberName if this NormalizedSchema should be considered a member schema.
   */
  constructor(ref, memberName) {
    this.ref = ref;
    this.memberName = memberName;
    this.symbol = _NormalizedSchema.symbol;
    const traitStack = [];
    let _ref = ref;
    let schema = ref;
    this._isMemberSchema = false;
    while (Array.isArray(_ref)) {
      traitStack.push(_ref[1]);
      _ref = _ref[0];
      schema = deref(_ref);
      this._isMemberSchema = true;
    }
    if (traitStack.length > 0) {
      this.memberTraits = {};
      for (let i = traitStack.length - 1; i >= 0; --i) {
        const traitSet = traitStack[i];
        Object.assign(this.memberTraits, _NormalizedSchema.translateTraits(traitSet));
      }
    } else {
      this.memberTraits = 0;
    }
    if (schema instanceof _NormalizedSchema) {
      this.name = schema.name;
      this.traits = schema.traits;
      this._isMemberSchema = schema._isMemberSchema;
      this.schema = schema.schema;
      this.memberTraits = Object.assign({}, schema.getMemberTraits(), this.getMemberTraits());
      this.normalizedTraits = void 0;
      this.ref = schema.ref;
      this.memberName = memberName ?? schema.memberName;
      return;
    }
    this.schema = deref(schema);
    if (this.schema && typeof this.schema === "object") {
      this.traits = this.schema?.traits ?? {};
    } else {
      this.traits = 0;
    }
    this.name = (typeof this.schema === "object" ? this.schema?.name : void 0) ?? this.memberName ?? this.getSchemaName();
    if (this._isMemberSchema && !memberName) {
      throw new Error(
        `@smithy/core/schema - NormalizedSchema member schema ${this.getName(
          true
        )} must initialize with memberName argument.`
      );
    }
  }
  static {
    this.symbol = Symbol.for("@smithy/core/schema::NormalizedSchema");
  }
  static [Symbol.hasInstance](lhs) {
    const isPrototype = _NormalizedSchema.prototype.isPrototypeOf(lhs);
    if (!isPrototype && typeof lhs === "object" && lhs !== null) {
      const ns = lhs;
      return ns.symbol === _NormalizedSchema.symbol;
    }
    return isPrototype;
  }
  /**
   * Static constructor that attempts to avoid wrapping a NormalizedSchema within another.
   */
  static of(ref, memberName) {
    if (ref instanceof _NormalizedSchema) {
      return ref;
    }
    return new _NormalizedSchema(ref, memberName);
  }
  /**
   * @param indicator - numeric indicator for preset trait combination.
   * @returns equivalent trait object.
   */
  static translateTraits(indicator) {
    if (typeof indicator === "object") {
      return indicator;
    }
    indicator = indicator | 0;
    const traits = {};
    if ((indicator & 1) === 1) {
      traits.httpLabel = 1;
    }
    if ((indicator >> 1 & 1) === 1) {
      traits.idempotent = 1;
    }
    if ((indicator >> 2 & 1) === 1) {
      traits.idempotencyToken = 1;
    }
    if ((indicator >> 3 & 1) === 1) {
      traits.sensitive = 1;
    }
    if ((indicator >> 4 & 1) === 1) {
      traits.httpPayload = 1;
    }
    if ((indicator >> 5 & 1) === 1) {
      traits.httpResponseCode = 1;
    }
    if ((indicator >> 6 & 1) === 1) {
      traits.httpQueryParams = 1;
    }
    return traits;
  }
  /**
   * Creates a normalized member schema from the given schema and member name.
   */
  static memberFrom(memberSchema, memberName) {
    if (memberSchema instanceof _NormalizedSchema) {
      memberSchema.memberName = memberName;
      memberSchema._isMemberSchema = true;
      return memberSchema;
    }
    return new _NormalizedSchema(memberSchema, memberName);
  }
  /**
   * @returns the underlying non-normalized schema.
   */
  getSchema() {
    if (this.schema instanceof _NormalizedSchema) {
      return this.schema = this.schema.getSchema();
    }
    if (this.schema instanceof SimpleSchema) {
      return deref(this.schema.schemaRef);
    }
    return deref(this.schema);
  }
  /**
   * @param withNamespace - qualifies the name.
   * @returns e.g. `MyShape` or `com.namespace#MyShape`.
   */
  getName(withNamespace = false) {
    if (!withNamespace) {
      if (this.name && this.name.includes("#")) {
        return this.name.split("#")[1];
      }
    }
    return this.name || void 0;
  }
  /**
   * @returns the member name if the schema is a member schema.
   * @throws Error when the schema isn't a member schema.
   */
  getMemberName() {
    if (!this.isMemberSchema()) {
      throw new Error(`@smithy/core/schema - cannot get member name on non-member schema: ${this.getName(true)}`);
    }
    return this.memberName;
  }
  isMemberSchema() {
    return this._isMemberSchema;
  }
  isUnitSchema() {
    return this.getSchema() === "unit";
  }
  /**
   * boolean methods on this class help control flow in shape serialization and deserialization.
   */
  isListSchema() {
    const inner = this.getSchema();
    if (typeof inner === "number") {
      return inner >= SCHEMA.LIST_MODIFIER && inner < SCHEMA.MAP_MODIFIER;
    }
    return inner instanceof ListSchema;
  }
  isMapSchema() {
    const inner = this.getSchema();
    if (typeof inner === "number") {
      return inner >= SCHEMA.MAP_MODIFIER && inner <= 255;
    }
    return inner instanceof MapSchema;
  }
  isDocumentSchema() {
    return this.getSchema() === SCHEMA.DOCUMENT;
  }
  isStructSchema() {
    const inner = this.getSchema();
    return inner !== null && typeof inner === "object" && "members" in inner || inner instanceof StructureSchema;
  }
  isBlobSchema() {
    return this.getSchema() === SCHEMA.BLOB || this.getSchema() === SCHEMA.STREAMING_BLOB;
  }
  isTimestampSchema() {
    const schema = this.getSchema();
    return typeof schema === "number" && schema >= SCHEMA.TIMESTAMP_DEFAULT && schema <= SCHEMA.TIMESTAMP_EPOCH_SECONDS;
  }
  isStringSchema() {
    return this.getSchema() === SCHEMA.STRING;
  }
  isBooleanSchema() {
    return this.getSchema() === SCHEMA.BOOLEAN;
  }
  isNumericSchema() {
    return this.getSchema() === SCHEMA.NUMERIC;
  }
  isBigIntegerSchema() {
    return this.getSchema() === SCHEMA.BIG_INTEGER;
  }
  isBigDecimalSchema() {
    return this.getSchema() === SCHEMA.BIG_DECIMAL;
  }
  isStreaming() {
    const streaming = !!this.getMergedTraits().streaming;
    if (streaming) {
      return true;
    }
    return this.getSchema() === SCHEMA.STREAMING_BLOB;
  }
  /**
   * @returns own traits merged with member traits, where member traits of the same trait key take priority.
   * This method is cached.
   */
  getMergedTraits() {
    if (this.normalizedTraits) {
      return this.normalizedTraits;
    }
    this.normalizedTraits = {
      ...this.getOwnTraits(),
      ...this.getMemberTraits()
    };
    return this.normalizedTraits;
  }
  /**
   * @returns only the member traits. If the schema is not a member, this returns empty.
   */
  getMemberTraits() {
    return _NormalizedSchema.translateTraits(this.memberTraits);
  }
  /**
   * @returns only the traits inherent to the shape or member target shape if this schema is a member.
   * If there are any member traits they are excluded.
   */
  getOwnTraits() {
    return _NormalizedSchema.translateTraits(this.traits);
  }
  /**
   * @returns the map's key's schema. Returns a dummy Document schema if this schema is a Document.
   *
   * @throws Error if the schema is not a Map or Document.
   */
  getKeySchema() {
    if (this.isDocumentSchema()) {
      return _NormalizedSchema.memberFrom([SCHEMA.DOCUMENT, 0], "key");
    }
    if (!this.isMapSchema()) {
      throw new Error(`@smithy/core/schema - cannot get key schema for non-map schema: ${this.getName(true)}`);
    }
    const schema = this.getSchema();
    if (typeof schema === "number") {
      return _NormalizedSchema.memberFrom([63 & schema, 0], "key");
    }
    return _NormalizedSchema.memberFrom([schema.keySchema, 0], "key");
  }
  /**
   * @returns the schema of the map's value or list's member.
   * Returns a dummy Document schema if this schema is a Document.
   *
   * @throws Error if the schema is not a Map, List, nor Document.
   */
  getValueSchema() {
    const schema = this.getSchema();
    if (typeof schema === "number") {
      if (this.isMapSchema()) {
        return _NormalizedSchema.memberFrom([63 & schema, 0], "value");
      } else if (this.isListSchema()) {
        return _NormalizedSchema.memberFrom([63 & schema, 0], "member");
      }
    }
    if (schema && typeof schema === "object") {
      if (this.isStructSchema()) {
        throw new Error(`cannot call getValueSchema() with StructureSchema ${this.getName(true)}`);
      }
      const collection = schema;
      if ("valueSchema" in collection) {
        if (this.isMapSchema()) {
          return _NormalizedSchema.memberFrom([collection.valueSchema, 0], "value");
        } else if (this.isListSchema()) {
          return _NormalizedSchema.memberFrom([collection.valueSchema, 0], "member");
        }
      }
    }
    if (this.isDocumentSchema()) {
      return _NormalizedSchema.memberFrom([SCHEMA.DOCUMENT, 0], "value");
    }
    throw new Error(`@smithy/core/schema - the schema ${this.getName(true)} does not have a value member.`);
  }
  /**
   * @returns the NormalizedSchema for the given member name. The returned instance will return true for `isMemberSchema()`
   * and will have the member name given.
   * @param member - which member to retrieve and wrap.
   *
   * @throws Error if member does not exist or the schema is neither a document nor structure.
   * Note that errors are assumed to be structures and unions are considered structures for these purposes.
   */
  getMemberSchema(member) {
    if (this.isStructSchema()) {
      const struct2 = this.getSchema();
      if (!(member in struct2.members)) {
        throw new Error(
          `@smithy/core/schema - the schema ${this.getName(true)} does not have a member with name=${member}.`
        );
      }
      return _NormalizedSchema.memberFrom(struct2.members[member], member);
    }
    if (this.isDocumentSchema()) {
      return _NormalizedSchema.memberFrom([SCHEMA.DOCUMENT, 0], member);
    }
    throw new Error(`@smithy/core/schema - the schema ${this.getName(true)} does not have members.`);
  }
  /**
   * This can be used for checking the members as a hashmap.
   * Prefer the structIterator method for iteration.
   *
   * This does NOT return list and map members, it is only for structures.
   *
   * @returns a map of member names to member schemas (normalized).
   */
  getMemberSchemas() {
    const { schema } = this;
    const struct2 = schema;
    if (!struct2 || typeof struct2 !== "object") {
      return {};
    }
    if ("members" in struct2) {
      const buffer = {};
      for (const member of struct2.memberNames) {
        buffer[member] = this.getMemberSchema(member);
      }
      return buffer;
    }
    return {};
  }
  /**
   * Allows iteration over members of a structure schema.
   * Each yield is a pair of the member name and member schema.
   *
   * This avoids the overhead of calling Object.entries(ns.getMemberSchemas()).
   */
  *structIterator() {
    if (this.isUnitSchema()) {
      return;
    }
    if (!this.isStructSchema()) {
      throw new Error("@smithy/core/schema - cannot acquire structIterator on non-struct schema.");
    }
    const struct2 = this.getSchema();
    for (let i = 0; i < struct2.memberNames.length; ++i) {
      yield [struct2.memberNames[i], _NormalizedSchema.memberFrom([struct2.memberList[i], 0], struct2.memberNames[i])];
    }
  }
  /**
   * @returns a last-resort human-readable name for the schema if it has no other identifiers.
   */
  getSchemaName() {
    const schema = this.getSchema();
    if (typeof schema === "number") {
      const _schema = 63 & schema;
      const container = 192 & schema;
      const type = Object.entries(SCHEMA).find(([, value]) => {
        return value === _schema;
      })?.[0] ?? "Unknown";
      switch (container) {
        case SCHEMA.MAP_MODIFIER:
          return `${type}Map`;
        case SCHEMA.LIST_MODIFIER:
          return `${type}List`;
        case 0:
          return type;
      }
    }
    return "Unknown";
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ErrorSchema,
  ListSchema,
  MapSchema,
  NormalizedSchema,
  OperationSchema,
  SCHEMA,
  Schema,
  SimpleSchema,
  StructureSchema,
  TypeRegistry,
  deref,
  deserializerMiddlewareOption,
  error,
  getSchemaSerdePlugin,
  list,
  map,
  op,
  serializerMiddlewareOption,
  sim,
  struct
});
