import {
  AwsCredentialIdentity,
  ChecksumConstructor,
  Endpoint,
  HashConstructor,
  MemoizedProvider,
  Pluggable,
  Provider,
  RegionInfoProvider,
  RelativeMiddlewareOptions,
  SerializeHandlerOptions,
  SerializeMiddleware,
} from "@smithy/types";
interface PreviouslyResolved {
  credentials: MemoizedProvider<AwsCredentialIdentity>;
  endpoint?: Provider<Endpoint>;
  region: Provider<string>;
  sha256: ChecksumConstructor | HashConstructor;
  signingEscapePath: boolean;
  regionInfoProvider?: RegionInfoProvider;
}
export declare function copySnapshotPresignedUrlMiddleware(
  options: PreviouslyResolved
): SerializeMiddleware<any, any>;
export declare const copySnapshotPresignedUrlMiddlewareOptions: SerializeHandlerOptions &
  RelativeMiddlewareOptions;
export declare const getCopySnapshotPresignedUrlPlugin: (
  config: PreviouslyResolved
) => Pluggable<any, any>;
export {};
