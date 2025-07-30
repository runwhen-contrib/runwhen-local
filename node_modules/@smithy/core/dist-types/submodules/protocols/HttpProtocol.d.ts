import { ClientProtocol, Codec, Endpoint, EndpointBearer, EndpointV2, HandlerExecutionContext, HttpRequest as IHttpRequest, HttpResponse as IHttpResponse, MetadataBearer, OperationSchema, ResponseMetadata, Schema, SerdeFunctions, ShapeDeserializer, ShapeSerializer } from "@smithy/types";
/**
 * Abstract base for HTTP-based client protocols.
 *
 * @alpha
 */
export declare abstract class HttpProtocol implements ClientProtocol<IHttpRequest, IHttpResponse> {
    readonly options: {
        defaultNamespace: string;
    };
    protected abstract serializer: ShapeSerializer<string | Uint8Array>;
    protected abstract deserializer: ShapeDeserializer<string | Uint8Array>;
    protected serdeContext?: SerdeFunctions;
    protected constructor(options: {
        defaultNamespace: string;
    });
    abstract getShapeId(): string;
    abstract getPayloadCodec(): Codec<any, any>;
    getRequestType(): new (...args: any[]) => IHttpRequest;
    getResponseType(): new (...args: any[]) => IHttpResponse;
    setSerdeContext(serdeContext: SerdeFunctions): void;
    abstract serializeRequest<Input extends object>(operationSchema: OperationSchema, input: Input, context: HandlerExecutionContext & SerdeFunctions & EndpointBearer): Promise<IHttpRequest>;
    updateServiceEndpoint(request: IHttpRequest, endpoint: EndpointV2 | Endpoint): IHttpRequest;
    abstract deserializeResponse<Output extends MetadataBearer>(operationSchema: OperationSchema, context: HandlerExecutionContext & SerdeFunctions, response: IHttpResponse): Promise<Output>;
    protected setHostPrefix<Input extends object>(request: IHttpRequest, operationSchema: OperationSchema, input: Input): void;
    protected abstract handleError(operationSchema: OperationSchema, context: HandlerExecutionContext & SerdeFunctions, response: IHttpResponse, dataObject: any, metadata: ResponseMetadata): Promise<never>;
    protected deserializeMetadata(output: IHttpResponse): ResponseMetadata;
    /**
     * @deprecated use signature without headerBindings.
     */
    protected deserializeHttpMessage(schema: Schema, context: HandlerExecutionContext & SerdeFunctions, response: IHttpResponse, headerBindings: Set<string>, dataObject: any): Promise<string[]>;
    protected deserializeHttpMessage(schema: Schema, context: HandlerExecutionContext & SerdeFunctions, response: IHttpResponse, dataObject: any): Promise<string[]>;
}
