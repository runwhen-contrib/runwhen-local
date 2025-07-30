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
import { EC2ClientResolvedConfig } from "../EC2Client";
export interface EC2HttpAuthSchemeParameters extends HttpAuthSchemeParameters {
  region?: string;
}
export interface EC2HttpAuthSchemeParametersProvider
  extends HttpAuthSchemeParametersProvider<
    EC2ClientResolvedConfig,
    HandlerExecutionContext,
    EC2HttpAuthSchemeParameters,
    object
  > {}
export declare const defaultEC2HttpAuthSchemeParametersProvider: (
  config: EC2ClientResolvedConfig,
  context: HandlerExecutionContext,
  input: object
) => Promise<EC2HttpAuthSchemeParameters>;
export interface EC2HttpAuthSchemeProvider
  extends HttpAuthSchemeProvider<EC2HttpAuthSchemeParameters> {}
export declare const defaultEC2HttpAuthSchemeProvider: EC2HttpAuthSchemeProvider;
export interface HttpAuthSchemeInputConfig extends AwsSdkSigV4AuthInputConfig {
  httpAuthSchemes?: HttpAuthScheme[];
  httpAuthSchemeProvider?: EC2HttpAuthSchemeProvider;
}
export interface HttpAuthSchemeResolvedConfig
  extends AwsSdkSigV4AuthResolvedConfig {
  readonly httpAuthSchemes: HttpAuthScheme[];
  readonly httpAuthSchemeProvider: EC2HttpAuthSchemeProvider;
}
export declare const resolveHttpAuthSchemeConfig: <T>(
  config: T & HttpAuthSchemeInputConfig & AwsSdkSigV4PreviouslyResolved
) => T & HttpAuthSchemeResolvedConfig;
