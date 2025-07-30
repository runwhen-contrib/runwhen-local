import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBSnapshotAttributeMessage,
  ModifyDBSnapshotAttributeResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBSnapshotAttributeCommandInput
  extends ModifyDBSnapshotAttributeMessage {}
export interface ModifyDBSnapshotAttributeCommandOutput
  extends ModifyDBSnapshotAttributeResult,
    __MetadataBearer {}
declare const ModifyDBSnapshotAttributeCommand_base: {
  new (
    input: ModifyDBSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBSnapshotAttributeCommandInput,
    ModifyDBSnapshotAttributeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBSnapshotAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBSnapshotAttributeCommandInput,
    ModifyDBSnapshotAttributeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBSnapshotAttributeCommand extends ModifyDBSnapshotAttributeCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBSnapshotAttributeMessage;
      output: ModifyDBSnapshotAttributeResult;
    };
    sdk: {
      input: ModifyDBSnapshotAttributeCommandInput;
      output: ModifyDBSnapshotAttributeCommandOutput;
    };
  };
}
