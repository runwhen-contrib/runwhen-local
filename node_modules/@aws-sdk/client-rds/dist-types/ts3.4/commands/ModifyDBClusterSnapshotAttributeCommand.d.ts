import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBClusterSnapshotAttributeMessage,
  ModifyDBClusterSnapshotAttributeResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBClusterSnapshotAttributeCommandInput
  extends ModifyDBClusterSnapshotAttributeMessage {}
export interface ModifyDBClusterSnapshotAttributeCommandOutput
  extends ModifyDBClusterSnapshotAttributeResult,
    __MetadataBearer {}
declare const ModifyDBClusterSnapshotAttributeCommand_base: {
  new (
    input: ModifyDBClusterSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterSnapshotAttributeCommandInput,
    ModifyDBClusterSnapshotAttributeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBClusterSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterSnapshotAttributeCommandInput,
    ModifyDBClusterSnapshotAttributeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBClusterSnapshotAttributeCommand extends ModifyDBClusterSnapshotAttributeCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBClusterSnapshotAttributeMessage;
      output: ModifyDBClusterSnapshotAttributeResult;
    };
    sdk: {
      input: ModifyDBClusterSnapshotAttributeCommandInput;
      output: ModifyDBClusterSnapshotAttributeCommandOutput;
    };
  };
}
