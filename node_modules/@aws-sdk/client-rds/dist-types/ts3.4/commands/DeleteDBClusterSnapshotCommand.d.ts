import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBClusterSnapshotMessage,
  DeleteDBClusterSnapshotResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBClusterSnapshotCommandInput
  extends DeleteDBClusterSnapshotMessage {}
export interface DeleteDBClusterSnapshotCommandOutput
  extends DeleteDBClusterSnapshotResult,
    __MetadataBearer {}
declare const DeleteDBClusterSnapshotCommand_base: {
  new (
    input: DeleteDBClusterSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterSnapshotCommandInput,
    DeleteDBClusterSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBClusterSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterSnapshotCommandInput,
    DeleteDBClusterSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBClusterSnapshotCommand extends DeleteDBClusterSnapshotCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBClusterSnapshotMessage;
      output: DeleteDBClusterSnapshotResult;
    };
    sdk: {
      input: DeleteDBClusterSnapshotCommandInput;
      output: DeleteDBClusterSnapshotCommandOutput;
    };
  };
}
