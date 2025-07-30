import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteSnapshotRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteSnapshotCommandInput extends DeleteSnapshotRequest {}
export interface DeleteSnapshotCommandOutput extends __MetadataBearer {}
declare const DeleteSnapshotCommand_base: {
  new (
    input: DeleteSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSnapshotCommandInput,
    DeleteSnapshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSnapshotCommandInput,
    DeleteSnapshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteSnapshotCommand extends DeleteSnapshotCommand_base {
  protected static __types: {
    api: {
      input: DeleteSnapshotRequest;
      output: {};
    };
    sdk: {
      input: DeleteSnapshotCommandInput;
      output: DeleteSnapshotCommandOutput;
    };
  };
}
