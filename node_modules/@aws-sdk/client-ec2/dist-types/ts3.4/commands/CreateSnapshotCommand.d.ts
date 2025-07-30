import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateSnapshotRequest, Snapshot } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateSnapshotCommandInput extends CreateSnapshotRequest {}
export interface CreateSnapshotCommandOutput
  extends Snapshot,
    __MetadataBearer {}
declare const CreateSnapshotCommand_base: {
  new (
    input: CreateSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSnapshotCommandInput,
    CreateSnapshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSnapshotCommandInput,
    CreateSnapshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateSnapshotCommand extends CreateSnapshotCommand_base {
  protected static __types: {
    api: {
      input: CreateSnapshotRequest;
      output: Snapshot;
    };
    sdk: {
      input: CreateSnapshotCommandInput;
      output: CreateSnapshotCommandOutput;
    };
  };
}
