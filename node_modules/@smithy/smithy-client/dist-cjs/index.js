var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Client: () => Client,
  Command: () => Command,
  NoOpLogger: () => NoOpLogger,
  SENSITIVE_STRING: () => SENSITIVE_STRING,
  ServiceException: () => ServiceException,
  _json: () => _json,
  collectBody: () => import_protocols.collectBody,
  convertMap: () => convertMap,
  createAggregatedClient: () => createAggregatedClient,
  decorateServiceException: () => decorateServiceException,
  emitWarningIfUnsupportedVersion: () => emitWarningIfUnsupportedVersion,
  extendedEncodeURIComponent: () => import_protocols.extendedEncodeURIComponent,
  getArrayIfSingleItem: () => getArrayIfSingleItem,
  getDefaultClientConfiguration: () => getDefaultClientConfiguration,
  getDefaultExtensionConfiguration: () => getDefaultExtensionConfiguration,
  getValueFromTextNode: () => getValueFromTextNode,
  isSerializableHeaderValue: () => isSerializableHeaderValue,
  loadConfigsForDefaultMode: () => loadConfigsForDefaultMode,
  map: () => map,
  resolveDefaultRuntimeConfig: () => resolveDefaultRuntimeConfig,
  resolvedPath: () => import_protocols.resolvedPath,
  serializeDateTime: () => serializeDateTime,
  serializeFloat: () => serializeFloat,
  take: () => take,
  throwDefaultError: () => throwDefaultError,
  withBaseException: () => withBaseException
});
module.exports = __toCommonJS(src_exports);

// src/client.ts
var import_middleware_stack = require("@smithy/middleware-stack");
var Client = class {
  constructor(config) {
    this.config = config;
    this.middlewareStack = (0, import_middleware_stack.constructStack)();
  }
  static {
    __name(this, "Client");
  }
  send(command, optionsOrCb, cb) {
    const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
    const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
    const useHandlerCache = options === void 0 && this.config.cacheMiddleware === true;
    let handler;
    if (useHandlerCache) {
      if (!this.handlers) {
        this.handlers = /* @__PURE__ */ new WeakMap();
      }
      const handlers = this.handlers;
      if (handlers.has(command.constructor)) {
        handler = handlers.get(command.constructor);
      } else {
        handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
        handlers.set(command.constructor, handler);
      }
    } else {
      delete this.handlers;
      handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
    }
    if (callback) {
      handler(command).then(
        (result) => callback(null, result.output),
        (err) => callback(err)
      ).catch(
        // prevent any errors thrown in the callback from triggering an
        // unhandled promise rejection
        () => {
        }
      );
    } else {
      return handler(command).then((result) => result.output);
    }
  }
  destroy() {
    this.config?.requestHandler?.destroy?.();
    delete this.handlers;
  }
};

// src/collect-stream-body.ts
var import_protocols = require("@smithy/core/protocols");

// src/command.ts

var import_types = require("@smithy/types");
var Command = class {
  constructor() {
    this.middlewareStack = (0, import_middleware_stack.constructStack)();
  }
  static {
    __name(this, "Command");
  }
  /**
   * Factory for Command ClassBuilder.
   * @internal
   */
  static classBuilder() {
    return new ClassBuilder();
  }
  /**
   * @internal
   */
  resolveMiddlewareWithContext(clientStack, configuration, options, {
    middlewareFn,
    clientName,
    commandName,
    inputFilterSensitiveLog,
    outputFilterSensitiveLog,
    smithyContext,
    additionalContext,
    CommandCtor
  }) {
    for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }
    const stack = clientStack.concat(this.middlewareStack);
    const { logger } = configuration;
    const handlerExecutionContext = {
      logger,
      clientName,
      commandName,
      inputFilterSensitiveLog,
      outputFilterSensitiveLog,
      [import_types.SMITHY_CONTEXT_KEY]: {
        commandInstance: this,
        ...smithyContext
      },
      ...additionalContext
    };
    const { requestHandler } = configuration;
    return stack.resolve(
      (request) => requestHandler.handle(request.request, options || {}),
      handlerExecutionContext
    );
  }
};
var ClassBuilder = class {
  constructor() {
    this._init = () => {
    };
    this._ep = {};
    this._middlewareFn = () => [];
    this._commandName = "";
    this._clientName = "";
    this._additionalContext = {};
    this._smithyContext = {};
    this._inputFilterSensitiveLog = (_) => _;
    this._outputFilterSensitiveLog = (_) => _;
    this._serializer = null;
    this._deserializer = null;
  }
  static {
    __name(this, "ClassBuilder");
  }
  /**
   * Optional init callback.
   */
  init(cb) {
    this._init = cb;
  }
  /**
   * Set the endpoint parameter instructions.
   */
  ep(endpointParameterInstructions) {
    this._ep = endpointParameterInstructions;
    return this;
  }
  /**
   * Add any number of middleware.
   */
  m(middlewareSupplier) {
    this._middlewareFn = middlewareSupplier;
    return this;
  }
  /**
   * Set the initial handler execution context Smithy field.
   */
  s(service, operation, smithyContext = {}) {
    this._smithyContext = {
      service,
      operation,
      ...smithyContext
    };
    return this;
  }
  /**
   * Set the initial handler execution context.
   */
  c(additionalContext = {}) {
    this._additionalContext = additionalContext;
    return this;
  }
  /**
   * Set constant string identifiers for the operation.
   */
  n(clientName, commandName) {
    this._clientName = clientName;
    this._commandName = commandName;
    return this;
  }
  /**
   * Set the input and output sensistive log filters.
   */
  f(inputFilter = (_) => _, outputFilter = (_) => _) {
    this._inputFilterSensitiveLog = inputFilter;
    this._outputFilterSensitiveLog = outputFilter;
    return this;
  }
  /**
   * Sets the serializer.
   */
  ser(serializer) {
    this._serializer = serializer;
    return this;
  }
  /**
   * Sets the deserializer.
   */
  de(deserializer) {
    this._deserializer = deserializer;
    return this;
  }
  /**
   * Sets input/output schema for the operation.
   */
  sc(operation) {
    this._operationSchema = operation;
    this._smithyContext.operationSchema = operation;
    return this;
  }
  /**
   * @returns a Command class with the classBuilder properties.
   */
  build() {
    const closure = this;
    let CommandRef;
    return CommandRef = class extends Command {
      /**
       * @public
       */
      constructor(...[input]) {
        super();
        /**
         * @internal
         */
        // @ts-ignore used in middlewareFn closure.
        this.serialize = closure._serializer;
        /**
         * @internal
         */
        // @ts-ignore used in middlewareFn closure.
        this.deserialize = closure._deserializer;
        this.input = input ?? {};
        closure._init(this);
        this.schema = closure._operationSchema;
      }
      static {
        __name(this, "CommandRef");
      }
      /**
       * @public
       */
      static getEndpointParameterInstructions() {
        return closure._ep;
      }
      /**
       * @internal
       */
      resolveMiddleware(stack, configuration, options) {
        return this.resolveMiddlewareWithContext(stack, configuration, options, {
          CommandCtor: CommandRef,
          middlewareFn: closure._middlewareFn,
          clientName: closure._clientName,
          commandName: closure._commandName,
          inputFilterSensitiveLog: closure._inputFilterSensitiveLog,
          outputFilterSensitiveLog: closure._outputFilterSensitiveLog,
          smithyContext: closure._smithyContext,
          additionalContext: closure._additionalContext
        });
      }
    };
  }
};

// src/constants.ts
var SENSITIVE_STRING = "***SensitiveInformation***";

// src/create-aggregated-client.ts
var createAggregatedClient = /* @__PURE__ */ __name((commands, Client2) => {
  for (const command of Object.keys(commands)) {
    const CommandCtor = commands[command];
    const methodImpl = /* @__PURE__ */ __name(async function(args, optionsOrCb, cb) {
      const command2 = new CommandCtor(args);
      if (typeof optionsOrCb === "function") {
        this.send(command2, optionsOrCb);
      } else if (typeof cb === "function") {
        if (typeof optionsOrCb !== "object")
          throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
        this.send(command2, optionsOrCb || {}, cb);
      } else {
        return this.send(command2, optionsOrCb);
      }
    }, "methodImpl");
    const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
    Client2.prototype[methodName] = methodImpl;
  }
}, "createAggregatedClient");

// src/exceptions.ts
var ServiceException = class _ServiceException extends Error {
  static {
    __name(this, "ServiceException");
  }
  constructor(options) {
    super(options.message);
    Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype);
    this.name = options.name;
    this.$fault = options.$fault;
    this.$metadata = options.$metadata;
  }
  /**
   * Checks if a value is an instance of ServiceException (duck typed)
   */
  static isInstance(value) {
    if (!value)
      return false;
    const candidate = value;
    return _ServiceException.prototype.isPrototypeOf(candidate) || Boolean(candidate.$fault) && Boolean(candidate.$metadata) && (candidate.$fault === "client" || candidate.$fault === "server");
  }
  /**
   * Custom instanceof check to support the operator for ServiceException base class
   */
  static [Symbol.hasInstance](instance) {
    if (!instance)
      return false;
    const candidate = instance;
    if (this === _ServiceException) {
      return _ServiceException.isInstance(instance);
    }
    if (_ServiceException.isInstance(instance)) {
      if (candidate.name && this.name) {
        return this.prototype.isPrototypeOf(instance) || candidate.name === this.name;
      }
      return this.prototype.isPrototypeOf(instance);
    }
    return false;
  }
};
var decorateServiceException = /* @__PURE__ */ __name((exception, additions = {}) => {
  Object.entries(additions).filter(([, v]) => v !== void 0).forEach(([k, v]) => {
    if (exception[k] == void 0 || exception[k] === "") {
      exception[k] = v;
    }
  });
  const message = exception.message || exception.Message || "UnknownError";
  exception.message = message;
  delete exception.Message;
  return exception;
}, "decorateServiceException");

// src/default-error-handler.ts
var throwDefaultError = /* @__PURE__ */ __name(({ output, parsedBody, exceptionCtor, errorCode }) => {
  const $metadata = deserializeMetadata(output);
  const statusCode = $metadata.httpStatusCode ? $metadata.httpStatusCode + "" : void 0;
  const response = new exceptionCtor({
    name: parsedBody?.code || parsedBody?.Code || errorCode || statusCode || "UnknownError",
    $fault: "client",
    $metadata
  });
  throw decorateServiceException(response, parsedBody);
}, "throwDefaultError");
var withBaseException = /* @__PURE__ */ __name((ExceptionCtor) => {
  return ({ output, parsedBody, errorCode }) => {
    throwDefaultError({ output, parsedBody, exceptionCtor: ExceptionCtor, errorCode });
  };
}, "withBaseException");
var deserializeMetadata = /* @__PURE__ */ __name((output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
}), "deserializeMetadata");

// src/defaults-mode.ts
var loadConfigsForDefaultMode = /* @__PURE__ */ __name((mode) => {
  switch (mode) {
    case "standard":
      return {
        retryMode: "standard",
        connectionTimeout: 3100
      };
    case "in-region":
      return {
        retryMode: "standard",
        connectionTimeout: 1100
      };
    case "cross-region":
      return {
        retryMode: "standard",
        connectionTimeout: 3100
      };
    case "mobile":
      return {
        retryMode: "standard",
        connectionTimeout: 3e4
      };
    default:
      return {};
  }
}, "loadConfigsForDefaultMode");

// src/emitWarningIfUnsupportedVersion.ts
var warningEmitted = false;
var emitWarningIfUnsupportedVersion = /* @__PURE__ */ __name((version) => {
  if (version && !warningEmitted && parseInt(version.substring(1, version.indexOf("."))) < 16) {
    warningEmitted = true;
  }
}, "emitWarningIfUnsupportedVersion");

// src/extended-encode-uri-component.ts


// src/extensions/checksum.ts

var getChecksumConfiguration = /* @__PURE__ */ __name((runtimeConfig) => {
  const checksumAlgorithms = [];
  for (const id in import_types.AlgorithmId) {
    const algorithmId = import_types.AlgorithmId[id];
    if (runtimeConfig[algorithmId] === void 0) {
      continue;
    }
    checksumAlgorithms.push({
      algorithmId: () => algorithmId,
      checksumConstructor: () => runtimeConfig[algorithmId]
    });
  }
  return {
    addChecksumAlgorithm(algo) {
      checksumAlgorithms.push(algo);
    },
    checksumAlgorithms() {
      return checksumAlgorithms;
    }
  };
}, "getChecksumConfiguration");
var resolveChecksumRuntimeConfig = /* @__PURE__ */ __name((clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
  });
  return runtimeConfig;
}, "resolveChecksumRuntimeConfig");

// src/extensions/retry.ts
var getRetryConfiguration = /* @__PURE__ */ __name((runtimeConfig) => {
  return {
    setRetryStrategy(retryStrategy) {
      runtimeConfig.retryStrategy = retryStrategy;
    },
    retryStrategy() {
      return runtimeConfig.retryStrategy;
    }
  };
}, "getRetryConfiguration");
var resolveRetryRuntimeConfig = /* @__PURE__ */ __name((retryStrategyConfiguration) => {
  const runtimeConfig = {};
  runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
  return runtimeConfig;
}, "resolveRetryRuntimeConfig");

// src/extensions/defaultExtensionConfiguration.ts
var getDefaultExtensionConfiguration = /* @__PURE__ */ __name((runtimeConfig) => {
  return Object.assign(getChecksumConfiguration(runtimeConfig), getRetryConfiguration(runtimeConfig));
}, "getDefaultExtensionConfiguration");
var getDefaultClientConfiguration = getDefaultExtensionConfiguration;
var resolveDefaultRuntimeConfig = /* @__PURE__ */ __name((config) => {
  return Object.assign(resolveChecksumRuntimeConfig(config), resolveRetryRuntimeConfig(config));
}, "resolveDefaultRuntimeConfig");

// src/get-array-if-single-item.ts
var getArrayIfSingleItem = /* @__PURE__ */ __name((mayBeArray) => Array.isArray(mayBeArray) ? mayBeArray : [mayBeArray], "getArrayIfSingleItem");

// src/get-value-from-text-node.ts
var getValueFromTextNode = /* @__PURE__ */ __name((obj) => {
  const textNodeName = "#text";
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== void 0) {
      obj[key] = obj[key][textNodeName];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = getValueFromTextNode(obj[key]);
    }
  }
  return obj;
}, "getValueFromTextNode");

// src/is-serializable-header-value.ts
var isSerializableHeaderValue = /* @__PURE__ */ __name((value) => {
  return value != null;
}, "isSerializableHeaderValue");

// src/NoOpLogger.ts
var NoOpLogger = class {
  static {
    __name(this, "NoOpLogger");
  }
  trace() {
  }
  debug() {
  }
  info() {
  }
  warn() {
  }
  error() {
  }
};

// src/object-mapping.ts
function map(arg0, arg1, arg2) {
  let target;
  let filter;
  let instructions;
  if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
    target = {};
    instructions = arg0;
  } else {
    target = arg0;
    if (typeof arg1 === "function") {
      filter = arg1;
      instructions = arg2;
      return mapWithFilter(target, filter, instructions);
    } else {
      instructions = arg1;
    }
  }
  for (const key of Object.keys(instructions)) {
    if (!Array.isArray(instructions[key])) {
      target[key] = instructions[key];
      continue;
    }
    applyInstruction(target, null, instructions, key);
  }
  return target;
}
__name(map, "map");
var convertMap = /* @__PURE__ */ __name((target) => {
  const output = {};
  for (const [k, v] of Object.entries(target || {})) {
    output[k] = [, v];
  }
  return output;
}, "convertMap");
var take = /* @__PURE__ */ __name((source, instructions) => {
  const out = {};
  for (const key in instructions) {
    applyInstruction(out, source, instructions, key);
  }
  return out;
}, "take");
var mapWithFilter = /* @__PURE__ */ __name((target, filter, instructions) => {
  return map(
    target,
    Object.entries(instructions).reduce(
      (_instructions, [key, value]) => {
        if (Array.isArray(value)) {
          _instructions[key] = value;
        } else {
          if (typeof value === "function") {
            _instructions[key] = [filter, value()];
          } else {
            _instructions[key] = [filter, value];
          }
        }
        return _instructions;
      },
      {}
    )
  );
}, "mapWithFilter");
var applyInstruction = /* @__PURE__ */ __name((target, source, instructions, targetKey) => {
  if (source !== null) {
    let instruction = instructions[targetKey];
    if (typeof instruction === "function") {
      instruction = [, instruction];
    }
    const [filter2 = nonNullish, valueFn = pass, sourceKey = targetKey] = instruction;
    if (typeof filter2 === "function" && filter2(source[sourceKey]) || typeof filter2 !== "function" && !!filter2) {
      target[targetKey] = valueFn(source[sourceKey]);
    }
    return;
  }
  let [filter, value] = instructions[targetKey];
  if (typeof value === "function") {
    let _value;
    const defaultFilterPassed = filter === void 0 && (_value = value()) != null;
    const customFilterPassed = typeof filter === "function" && !!filter(void 0) || typeof filter !== "function" && !!filter;
    if (defaultFilterPassed) {
      target[targetKey] = _value;
    } else if (customFilterPassed) {
      target[targetKey] = value();
    }
  } else {
    const defaultFilterPassed = filter === void 0 && value != null;
    const customFilterPassed = typeof filter === "function" && !!filter(value) || typeof filter !== "function" && !!filter;
    if (defaultFilterPassed || customFilterPassed) {
      target[targetKey] = value;
    }
  }
}, "applyInstruction");
var nonNullish = /* @__PURE__ */ __name((_) => _ != null, "nonNullish");
var pass = /* @__PURE__ */ __name((_) => _, "pass");

// src/resolve-path.ts


// src/ser-utils.ts
var serializeFloat = /* @__PURE__ */ __name((value) => {
  if (value !== value) {
    return "NaN";
  }
  switch (value) {
    case Infinity:
      return "Infinity";
    case -Infinity:
      return "-Infinity";
    default:
      return value;
  }
}, "serializeFloat");
var serializeDateTime = /* @__PURE__ */ __name((date) => date.toISOString().replace(".000Z", "Z"), "serializeDateTime");

// src/serde-json.ts
var _json = /* @__PURE__ */ __name((obj) => {
  if (obj == null) {
    return {};
  }
  if (Array.isArray(obj)) {
    return obj.filter((_) => _ != null).map(_json);
  }
  if (typeof obj === "object") {
    const target = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] == null) {
        continue;
      }
      target[key] = _json(obj[key]);
    }
    return target;
  }
  return obj;
}, "_json");

// src/index.ts
__reExport(src_exports, require("@smithy/core/serde"), module.exports);
// Annotate the CommonJS export names for ESM import in node:

0 && (module.exports = {
  Client,
  collectBody,
  Command,
  SENSITIVE_STRING,
  createAggregatedClient,
  throwDefaultError,
  withBaseException,
  loadConfigsForDefaultMode,
  emitWarningIfUnsupportedVersion,
  ServiceException,
  decorateServiceException,
  extendedEncodeURIComponent,
  getDefaultExtensionConfiguration,
  getDefaultClientConfiguration,
  resolveDefaultRuntimeConfig,
  getArrayIfSingleItem,
  getValueFromTextNode,
  isSerializableHeaderValue,
  NoOpLogger,
  convertMap,
  take,
  map,
  resolvedPath,
  serializeFloat,
  serializeDateTime,
  _json,
  LazyJsonString,
  NumericValue,
  copyDocumentWithTransform,
  dateToUtcString,
  expectBoolean,
  expectByte,
  expectFloat32,
  expectInt,
  expectInt32,
  expectLong,
  expectNonNull,
  expectNumber,
  expectObject,
  expectShort,
  expectString,
  expectUnion,
  handleFloat,
  limitedParseDouble,
  limitedParseFloat,
  limitedParseFloat32,
  logger,
  nv,
  parseBoolean,
  parseEpochTimestamp,
  parseRfc3339DateTime,
  parseRfc3339DateTimeWithOffset,
  parseRfc7231DateTime,
  quoteHeader,
  splitEvery,
  splitHeader,
  strictParseByte,
  strictParseDouble,
  strictParseFloat,
  strictParseFloat32,
  strictParseInt,
  strictParseInt32,
  strictParseLong,
  strictParseShort
});

