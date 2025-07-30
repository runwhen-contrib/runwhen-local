import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBSnapshotMessage,
  DeleteDBSnapshotResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBSnapshotCommandInput extends DeleteDBSnapshotMessage {}
export interface DeleteDBSnapshotCommandOutput
  extends DeleteDBSnapshotResult,
    __MetadataBearer {}
declare const DeleteDBSnapshotCommand_base: {
  new (
    input: DeleteDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBSnapshotCommandInput,
    DeleteDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBSnapshotCommandInput,
    DeleteDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBSnapshotCommand extends DeleteDBSnapshotCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBSnapshotMessage;
      output: DeleteDBSnapshotResult;
    };
    sdk: {
      input: DeleteDBSnapshotCommandInput;
      output: DeleteDBSnapshotCommandOutput;
    };
  };
}
