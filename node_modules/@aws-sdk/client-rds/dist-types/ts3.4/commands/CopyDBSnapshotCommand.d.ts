import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CopyDBSnapshotMessage,
  CopyDBSnapshotResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CopyDBSnapshotCommandInput extends CopyDBSnapshotMessage {}
export interface CopyDBSnapshotCommandOutput
  extends CopyDBSnapshotResult,
    __MetadataBearer {}
declare const CopyDBSnapshotCommand_base: {
  new (
    input: CopyDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBSnapshotCommandInput,
    CopyDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CopyDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyDBSnapshotCommandInput,
    CopyDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CopyDBSnapshotCommand extends CopyDBSnapshotCommand_base {
  protected static __types: {
    api: {
      input: CopyDBSnapshotMessage;
      output: CopyDBSnapshotResult;
    };
    sdk: {
      input: CopyDBSnapshotCommandInput;
      output: CopyDBSnapshotCommandOutput;
    };
  };
}
