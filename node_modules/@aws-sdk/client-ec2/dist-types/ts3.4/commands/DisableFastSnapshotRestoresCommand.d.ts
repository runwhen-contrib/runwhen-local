import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableFastSnapshotRestoresRequest,
  DisableFastSnapshotRestoresResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableFastSnapshotRestoresCommandInput
  extends DisableFastSnapshotRestoresRequest {}
export interface DisableFastSnapshotRestoresCommandOutput
  extends DisableFastSnapshotRestoresResult,
    __MetadataBearer {}
declare const DisableFastSnapshotRestoresCommand_base: {
  new (
    input: DisableFastSnapshotRestoresCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableFastSnapshotRestoresCommandInput,
    DisableFastSnapshotRestoresCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableFastSnapshotRestoresCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableFastSnapshotRestoresCommandInput,
    DisableFastSnapshotRestoresCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableFastSnapshotRestoresCommand extends DisableFastSnapshotRestoresCommand_base {
  protected static __types: {
    api: {
      input: DisableFastSnapshotRestoresRequest;
      output: DisableFastSnapshotRestoresResult;
    };
    sdk: {
      input: DisableFastSnapshotRestoresCommandInput;
      output: DisableFastSnapshotRestoresCommandOutput;
    };
  };
}
