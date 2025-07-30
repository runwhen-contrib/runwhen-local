import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBClusterSnapshotMessage,
  CreateDBClusterSnapshotResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBClusterSnapshotCommandInput
  extends CreateDBClusterSnapshotMessage {}
export interface CreateDBClusterSnapshotCommandOutput
  extends CreateDBClusterSnapshotResult,
    __MetadataBearer {}
declare const CreateDBClusterSnapshotCommand_base: {
  new (
    input: CreateDBClusterSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterSnapshotCommandInput,
    CreateDBClusterSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBClusterSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterSnapshotCommandInput,
    CreateDBClusterSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBClusterSnapshotCommand extends CreateDBClusterSnapshotCommand_base {
  protected static __types: {
    api: {
      input: CreateDBClusterSnapshotMessage;
      output: CreateDBClusterSnapshotResult;
    };
    sdk: {
      input: CreateDBClusterSnapshotCommandInput;
      output: CreateDBClusterSnapshotCommandOutput;
    };
  };
}
