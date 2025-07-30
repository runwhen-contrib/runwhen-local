import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ImportSnapshotRequest,
  ImportSnapshotResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ImportSnapshotCommandInput extends ImportSnapshotRequest {}
export interface ImportSnapshotCommandOutput
  extends ImportSnapshotResult,
    __MetadataBearer {}
declare const ImportSnapshotCommand_base: {
  new (
    input: ImportSnapshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ImportSnapshotCommandInput,
    ImportSnapshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ImportSnapshotCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ImportSnapshotCommandInput,
    ImportSnapshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ImportSnapshotCommand extends ImportSnapshotCommand_base {
  protected static __types: {
    api: {
      input: ImportSnapshotRequest;
      output: ImportSnapshotResult;
    };
    sdk: {
      input: ImportSnapshotCommandInput;
      output: ImportSnapshotCommandOutput;
    };
  };
}
