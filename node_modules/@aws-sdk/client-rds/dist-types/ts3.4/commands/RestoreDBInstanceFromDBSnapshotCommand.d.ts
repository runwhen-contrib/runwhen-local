import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RestoreDBInstanceFromDBSnapshotMessage,
  RestoreDBInstanceFromDBSnapshotResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RestoreDBInstanceFromDBSnapshotCommandInput
  extends RestoreDBInstanceFromDBSnapshotMessage {}
export interface RestoreDBInstanceFromDBSnapshotCommandOutput
  extends RestoreDBInstanceFromDBSnapshotResult,
    __MetadataBearer {}
declare const RestoreDBInstanceFromDBSnapshotCommand_base: {
  new (
    input: RestoreDBInstanceFromDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBInstanceFromDBSnapshotCommandInput,
    RestoreDBInstanceFromDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreDBInstanceFromDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBInstanceFromDBSnapshotCommandInput,
    RestoreDBInstanceFromDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreDBInstanceFromDBSnapshotCommand extends RestoreDBInstanceFromDBSnapshotCommand_base {
  protected static __types: {
    api: {
      input: RestoreDBInstanceFromDBSnapshotMessage;
      output: RestoreDBInstanceFromDBSnapshotResult;
    };
    sdk: {
      input: RestoreDBInstanceFromDBSnapshotCommandInput;
      output: RestoreDBInstanceFromDBSnapshotCommandOutput;
    };
  };
}
