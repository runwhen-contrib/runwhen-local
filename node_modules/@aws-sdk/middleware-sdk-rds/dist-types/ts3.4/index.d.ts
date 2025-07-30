import {
  AwsCredentialIdentity,
  ChecksumConstructor,
  Endpoint,
  HashConstructor,
  InitializeMiddleware,
  MemoizedProvider,
  Pluggable,
  Provider,
  RelativeMiddlewareOptions,
  SerializeHandlerOptions,
} from "@smithy/types";
interface PreviouslyResolved {
  credentials: MemoizedProvider<AwsCredentialIdentity>;
  endpoint?: Provider<Endpoint>;
  region: Provider<string>;
  sha256: ChecksumConstructor | HashConstructor;
  signingEscapePath: boolean;
}
export declare function crossRegionPresignedUrlMiddleware(
  options: PreviouslyResolved
): InitializeMiddleware<any, any>;
export declare const crossRegionPresignedUrlMiddlewareOptions: SerializeHandlerOptions &
  RelativeMiddlewareOptions;
export declare const getCrossRegionPresignedUrlPlugin: (
  config: PreviouslyResolved
) => Pluggable<any, any>;
export {};
