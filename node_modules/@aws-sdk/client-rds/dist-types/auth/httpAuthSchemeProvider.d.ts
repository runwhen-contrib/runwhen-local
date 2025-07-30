import { AwsSdkSigV4AuthInputConfig, AwsSdkSigV4AuthResolvedConfig, AwsSdkSigV4PreviouslyResolved } from "@aws-sdk/core";
import { HandlerExecutionContext, HttpAuthScheme, HttpAuthSchemeParameters, HttpAuthSchemeParametersProvider, HttpAuthSchemeProvider } from "@smithy/types";
import { RDSClientResolvedConfig } from "../RDSClient";
/**
 * @internal
 */
export interface RDSHttpAuthSchemeParameters extends HttpAuthSchemeParameters {
    region?: string;
}
/**
 * @internal
 */
export interface RDSHttpAuthSchemeParametersProvider extends HttpAuthSchemeParametersProvider<RDSClientResolvedConfig, HandlerExecutionContext, RDSHttpAuthSchemeParameters, object> {
}
/**
 * @internal
 */
export declare const defaultRDSHttpAuthSchemeParametersProvider: (config: RDSClientResolvedConfig, context: HandlerExecutionContext, input: object) => Promise<RDSHttpAuthSchemeParameters>;
/**
 * @internal
 */
export interface RDSHttpAuthSchemeProvider extends HttpAuthSchemeProvider<RDSHttpAuthSchemeParameters> {
}
/**
 * @internal
 */
export declare const defaultRDSHttpAuthSchemeProvider: RDSHttpAuthSchemeProvider;
/**
 * @internal
 */
export interface HttpAuthSchemeInputConfig extends AwsSdkSigV4AuthInputConfig {
    /**
     * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
     * @internal
     */
    httpAuthSchemes?: HttpAuthScheme[];
    /**
     * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
     * @internal
     */
    httpAuthSchemeProvider?: RDSHttpAuthSchemeProvider;
}
/**
 * @internal
 */
export interface HttpAuthSchemeResolvedConfig extends AwsSdkSigV4AuthResolvedConfig {
    /**
     * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
     * @internal
     */
    readonly httpAuthSchemes: HttpAuthScheme[];
    /**
     * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
     * @internal
     */
    readonly httpAuthSchemeProvider: RDSHttpAuthSchemeProvider;
}
/**
 * @internal
 */
export declare const resolveHttpAuthSchemeConfig: <T>(config: T & HttpAuthSchemeInputConfig & AwsSdkSigV4PreviouslyResolved) => T & HttpAuthSchemeResolvedConfig;
