import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CopyDBClusterSnapshotMessage,
  CopyDBClusterSnapshotResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CopyDBClusterSnapshotCommandInput
  extends CopyDBClusterSnapshotMessage {}
export interface CopyDBClusterSnapshotCommandOutput
  extends CopyDBClusterSnapshotResult,
    __MetadataBearer {}
declare const CopyDBClusterSnapshotCommand_base: {
  new (
    input: CopyDBClusterSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBClusterSnapshotCommandInput,
    CopyDBClusterSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CopyDBClusterSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBClusterSnapshotCommandInput,
    CopyDBClusterSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CopyDBClusterSnapshotCommand extends CopyDBClusterSnapshotCommand_base {
  protected static __types: {
    api: {
      input: CopyDBClusterSnapshotMessage;
      output: CopyDBClusterSnapshotResult;
    };
    sdk: {
      input: CopyDBClusterSnapshotCommandInput;
      output: CopyDBClusterSnapshotCommandOutput;
    };
  };
}
