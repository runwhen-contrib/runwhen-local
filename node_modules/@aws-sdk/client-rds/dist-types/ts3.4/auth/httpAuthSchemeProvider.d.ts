import {
  AwsSdkSigV4AuthInputConfig,
  AwsSdkSigV4AuthResolvedConfig,
  AwsSdkSigV4PreviouslyResolved,
} from "@aws-sdk/core";
import {
  HandlerExecutionContext,
  HttpAuthScheme,
  HttpAuthSchemeParameters,
  HttpAuthSchemeParametersProvider,
  HttpAuthSchemeProvider,
} from "@smithy/types";
import { RDSClientResolvedConfig } from "../RDSClient";
export interface RDSHttpAuthSchemeParameters extends HttpAuthSchemeParameters {
  region?: string;
}
export interface RDSHttpAuthSchemeParametersProvider
  extends HttpAuthSchemeParametersProvider<
    RDSClientResolvedConfig,
    HandlerExecutionContext,
    RDSHttpAuthSchemeParameters,
    object
  > {}
export declare const defaultRDSHttpAuthSchemeParametersProvider: (
  config: RDSClientResolvedConfig,
  context: HandlerExecutionContext,
  input: object
) => Promise<RDSHttpAuthSchemeParameters>;
export interface RDSHttpAuthSchemeProvider
  extends HttpAuthSchemeProvider<RDSHttpAuthSchemeParameters> {}
export declare const defaultRDSHttpAuthSchemeProvider: RDSHttpAuthSchemeProvider;
export interface HttpAuthSchemeInputConfig extends AwsSdkSigV4AuthInputConfig {
  httpAuthSchemes?: HttpAuthScheme[];
  httpAuthSchemeProvider?: RDSHttpAuthSchemeProvider;
}
export interface HttpAuthSchemeResolvedConfig
  extends AwsSdkSigV4AuthResolvedConfig {
  readonly httpAuthSchemes: HttpAuthScheme[];
  readonly httpAuthSchemeProvider: RDSHttpAuthSchemeProvider;
}
export declare const resolveHttpAuthSchemeConfig: <T>(
  config: T & HttpAuthSchemeInputConfig & AwsSdkSigV4PreviouslyResolved
) => T & HttpAuthSchemeResolvedConfig;
