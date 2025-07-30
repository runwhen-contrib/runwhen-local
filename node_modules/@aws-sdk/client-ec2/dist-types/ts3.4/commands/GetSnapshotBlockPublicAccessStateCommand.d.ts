import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetSnapshotBlockPublicAccessStateRequest,
  GetSnapshotBlockPublicAccessStateResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetSnapshotBlockPublicAccessStateCommandInput
  extends GetSnapshotBlockPublicAccessStateRequest {}
export interface GetSnapshotBlockPublicAccessStateCommandOutput
  extends GetSnapshotBlockPublicAccessStateResult,
    __MetadataBearer {}
declare const GetSnapshotBlockPublicAccessStateCommand_base: {
  new (
    input: GetSnapshotBlockPublicAccessStateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSnapshotBlockPublicAccessStateCommandInput,
    GetSnapshotBlockPublicAccessStateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetSnapshotBlockPublicAccessStateCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetSnapshotBlockPublicAccessStateCommandInput,
    GetSnapshotBlockPublicAccessStateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetSnapshotBlockPublicAccessStateCommand extends GetSnapshotBlockPublicAccessStateCommand_base {
  protected static __types: {
    api: {
      input: GetSnapshotBlockPublicAccessStateRequest;
      output: GetSnapshotBlockPublicAccessStateResult;
    };
    sdk: {
      input: GetSnapshotBlockPublicAccessStateCommandInput;
      output: GetSnapshotBlockPublicAccessStateCommandOutput;
    };
  };
}
