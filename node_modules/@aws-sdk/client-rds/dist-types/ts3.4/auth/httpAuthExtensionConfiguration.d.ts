import {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
  HttpAuthScheme,
} from "@smithy/types";
import { RDSHttpAuthSchemeProvider } from "./httpAuthSchemeProvider";
export interface HttpAuthExtensionConfiguration {
  setHttpAuthScheme(httpAuthScheme: HttpAuthScheme): void;
  httpAuthSchemes(): HttpAuthScheme[];
  setHttpAuthSchemeProvider(
    httpAuthSchemeProvider: RDSHttpAuthSchemeProvider
  ): void;
  httpAuthSchemeProvider(): RDSHttpAuthSchemeProvider;
  setCredentials(
    credentials: AwsCredentialIdentity | AwsCredentialIdentityProvider
  ): void;
  credentials():
    | AwsCredentialIdentity
    | AwsCredentialIdentityProvider
    | undefined;
}
export type HttpAuthRuntimeConfig = Partial<{
  httpAuthSchemes: HttpAuthScheme[];
  httpAuthSchemeProvider: RDSHttpAuthSchemeProvider;
  credentials: AwsCredentialIdentity | AwsCredentialIdentityProvider;
}>;
export declare const getHttpAuthExtensionConfiguration: (
  runtimeConfig: HttpAuthRuntimeConfig
) => HttpAuthExtensionConfiguration;
export declare const resolveHttpAuthRuntimeConfig: (
  config: HttpAuthExtensionConfiguration
) => HttpAuthRuntimeConfig;
