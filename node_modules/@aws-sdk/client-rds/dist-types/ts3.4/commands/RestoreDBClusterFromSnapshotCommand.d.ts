import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RestoreDBClusterFromSnapshotMessage,
  RestoreDBClusterFromSnapshotResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RestoreDBClusterFromSnapshotCommandInput
  extends RestoreDBClusterFromSnapshotMessage {}
export interface RestoreDBClusterFromSnapshotCommandOutput
  extends RestoreDBClusterFromSnapshotResult,
    __MetadataBearer {}
declare const RestoreDBClusterFromSnapshotCommand_base: {
  new (
    input: RestoreDBClusterFromSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBClusterFromSnapshotCommandInput,
    RestoreDBClusterFromSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreDBClusterFromSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBClusterFromSnapshotCommandInput,
    RestoreDBClusterFromSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreDBClusterFromSnapshotCommand extends RestoreDBClusterFromSnapshotCommand_base {
  protected static __types: {
    api: {
      input: RestoreDBClusterFromSnapshotMessage;
      output: RestoreDBClusterFromSnapshotResult;
    };
    sdk: {
      input: RestoreDBClusterFromSnapshotCommandInput;
      output: RestoreDBClusterFromSnapshotCommandOutput;
    };
  };
}
