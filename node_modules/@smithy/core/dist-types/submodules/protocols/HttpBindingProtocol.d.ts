import { NormalizedSchema } from "@smithy/core/schema";
import { HttpRequest } from "@smithy/protocol-http";
import { EndpointBearer, HandlerExecutionContext, HttpRequest as IHttpRequest, HttpResponse as IHttpResponse, MetadataBearer, OperationSchema, SerdeFunctions } from "@smithy/types";
import { HttpProtocol } from "./HttpProtocol";
/**
 * Base for HTTP-binding protocols. Downstream examples
 * include AWS REST JSON and AWS REST XML.
 *
 * @alpha
 */
export declare abstract class HttpBindingProtocol extends HttpProtocol {
    serializeRequest<Input extends object>(operationSchema: OperationSchema, _input: Input, context: HandlerExecutionContext & SerdeFunctions & EndpointBearer): Promise<IHttpRequest>;
    protected serializeQuery(ns: NormalizedSchema, data: any, query: HttpRequest["query"]): void;
    deserializeResponse<Output extends MetadataBearer>(operationSchema: OperationSchema, context: HandlerExecutionContext & SerdeFunctions, response: IHttpResponse): Promise<Output>;
}
