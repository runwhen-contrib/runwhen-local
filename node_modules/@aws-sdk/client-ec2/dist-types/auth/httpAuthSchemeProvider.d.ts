import { AwsSdkSigV4AuthInputConfig, AwsSdkSigV4AuthResolvedConfig, AwsSdkSigV4PreviouslyResolved } from "@aws-sdk/core";
import { HandlerExecutionContext, HttpAuthScheme, HttpAuthSchemeParameters, HttpAuthSchemeParametersProvider, HttpAuthSchemeProvider } from "@smithy/types";
import { EC2ClientResolvedConfig } from "../EC2Client";
/**
 * @internal
 */
export interface EC2HttpAuthSchemeParameters extends HttpAuthSchemeParameters {
    region?: string;
}
/**
 * @internal
 */
export interface EC2HttpAuthSchemeParametersProvider extends HttpAuthSchemeParametersProvider<EC2ClientResolvedConfig, HandlerExecutionContext, EC2HttpAuthSchemeParameters, object> {
}
/**
 * @internal
 */
export declare const defaultEC2HttpAuthSchemeParametersProvider: (config: EC2ClientResolvedConfig, context: HandlerExecutionContext, input: object) => Promise<EC2HttpAuthSchemeParameters>;
/**
 * @internal
 */
export interface EC2HttpAuthSchemeProvider extends HttpAuthSchemeProvider<EC2HttpAuthSchemeParameters> {
}
/**
 * @internal
 */
export declare const defaultEC2HttpAuthSchemeProvider: EC2HttpAuthSchemeProvider;
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
    httpAuthSchemeProvider?: EC2HttpAuthSchemeProvider;
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
    readonly httpAuthSchemeProvider: EC2HttpAuthSchemeProvider;
}
/**
 * @internal
 */
export declare const resolveHttpAuthSchemeConfig: <T>(config: T & HttpAuthSchemeInputConfig & AwsSdkSigV4PreviouslyResolved) => T & HttpAuthSchemeResolvedConfig;
