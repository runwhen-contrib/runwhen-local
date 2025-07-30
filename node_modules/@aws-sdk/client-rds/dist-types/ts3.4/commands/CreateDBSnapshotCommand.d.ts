import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBSnapshotMessage,
  CreateDBSnapshotResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBSnapshotCommandInput extends CreateDBSnapshotMessage {}
export interface CreateDBSnapshotCommandOutput
  extends CreateDBSnapshotResult,
    __MetadataBearer {}
declare const CreateDBSnapshotCommand_base: {
  new (
    input: CreateDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBSnapshotCommandInput,
    CreateDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBSnapshotCommandInput,
    CreateDBSnapshotCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBSnapshotCommand extends CreateDBSnapshotCommand_base {
  protected static __types: {
    api: {
      input: CreateDBSnapshotMessage;
      output: CreateDBSnapshotResult;
    };
    sdk: {
      input: CreateDBSnapshotCommandInput;
      output: CreateDBSnapshotCommandOutput;
    };
  };
}
