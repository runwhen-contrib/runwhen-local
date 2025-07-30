import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBSnapshotMessage,
  ModifyDBSnapshotResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBSnapshotCommandInput extends ModifyDBSnapshotMessage {}
export interface ModifyDBSnapshotCommandOutput
  extends ModifyDBSnapshotResult,
    __MetadataBearer {}
declare const ModifyDBSnapshotCommand_base: {
  new (
    input: ModifyDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBSnapshotCommandInput,
    ModifyDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBSnapshotCommandInput,
    ModifyDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBSnapshotCommand extends ModifyDBSnapshotCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBSnapshotMessage;
      output: ModifyDBSnapshotResult;
    };
    sdk: {
      input: ModifyDBSnapshotCommandInput;
      output: ModifyDBSnapshotCommandOutput;
    };
  };
}
