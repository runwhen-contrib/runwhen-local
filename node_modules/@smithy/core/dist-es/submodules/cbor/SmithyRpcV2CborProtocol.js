import { RpcProtocol } from "@smithy/core/protocols";
import { deref, TypeRegistry } from "@smithy/core/schema";
import { getSmithyContext } from "@smithy/util-middleware";
import { CborCodec } from "./CborCodec";
import { loadSmithyRpcV2CborErrorCode } from "./parseCborBody";
export class SmithyRpcV2CborProtocol extends RpcProtocol {
    constructor({ defaultNamespace }) {
        super({ defaultNamespace });
        this.codec = new CborCodec();
        this.serializer = this.codec.createSerializer();
        this.deserializer = this.codec.createDeserializer();
    }
    getShapeId() {
        return "smithy.protocols#rpcv2Cbor";
    }
    getPayloadCodec() {
        return this.codec;
    }
    async serializeRequest(operationSchema, input, context) {
        const request = await super.serializeRequest(operationSchema, input, context);
        Object.assign(request.headers, {
            "content-type": "application/cbor",
            "smithy-protocol": "rpc-v2-cbor",
            accept: "application/cbor",
        });
        if (deref(operationSchema.input) === "unit") {
            delete request.body;
            delete request.headers["content-type"];
        }
        else {
            if (!request.body) {
                this.serializer.write(15, {});
                request.body = this.serializer.flush();
            }
            try {
                request.headers["content-length"] = String(request.body.byteLength);
            }
            catch (e) { }
        }
        const { service, operation } = getSmithyContext(context);
        const path = `/service/${service}/operation/${operation}`;
        if (request.path.endsWith("/")) {
            request.path += path.slice(1);
        }
        else {
            request.path += path;
        }
        return request;
    }
    async deserializeResponse(operationSchema, context, response) {
        return super.deserializeResponse(operationSchema, context, response);
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
        const error = loadSmithyRpcV2CborErrorCode(response, dataObject) ?? "Unknown";
        let namespace = this.options.defaultNamespace;
        if (error.includes("#")) {
            [namespace] = error.split("#");
        }
        const registry = TypeRegistry.for(namespace);
        const errorSchema = registry.getSchema(error);
        if (!errorSchema) {
            throw new Error("schema not found for " + error);
        }
        const message = dataObject.message ?? dataObject.Message ?? "Unknown";
        const exception = new errorSchema.ctor(message);
        Object.assign(exception, {
            $metadata: metadata,
            $response: response,
            message,
            ...dataObject,
        });
        throw exception;
    }
}
