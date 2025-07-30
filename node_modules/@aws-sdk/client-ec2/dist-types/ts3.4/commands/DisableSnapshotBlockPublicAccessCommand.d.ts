import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableSnapshotBlockPublicAccessRequest,
  DisableSnapshotBlockPublicAccessResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface DisableSnapshotBlockPublicAccessCommandInput
  extends DisableSnapshotBlockPublicAccessRequest {}
export interface DisableSnapshotBlockPublicAccessCommandOutput
  extends DisableSnapshotBlockPublicAccessResult,
    __MetadataBearer {}
declare const DisableSnapshotBlockPublicAccessCommand_base: {
  new (
    input: DisableSnapshotBlockPublicAccessCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableSnapshotBlockPublicAccessCommandInput,
    DisableSnapshotBlockPublicAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisableSnapshotBlockPublicAccessCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableSnapshotBlockPublicAccessCommandInput,
    DisableSnapshotBlockPublicAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableSnapshotBlockPublicAccessCommand extends DisableSnapshotBlockPublicAccessCommand_base {
  protected static __types: {
    api: {
      input: DisableSnapshotBlockPublicAccessRequest;
      output: DisableSnapshotBlockPublicAccessResult;
    };
    sdk: {
      input: DisableSnapshotBlockPublicAccessCommandInput;
      output: DisableSnapshotBlockPublicAccessCommandOutput;
    };
  };
}
