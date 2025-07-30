import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ListSnapshotsInRecycleBinRequest,
  ListSnapshotsInRecycleBinResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ListSnapshotsInRecycleBinCommandInput
  extends ListSnapshotsInRecycleBinRequest {}
export interface ListSnapshotsInRecycleBinCommandOutput
  extends ListSnapshotsInRecycleBinResult,
    __MetadataBearer {}
declare const ListSnapshotsInRecycleBinCommand_base: {
  new (
    input: ListSnapshotsInRecycleBinCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ListSnapshotsInRecycleBinCommandInput,
    ListSnapshotsInRecycleBinCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ListSnapshotsInRecycleBinCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ListSnapshotsInRecycleBinCommandInput,
    ListSnapshotsInRecycleBinCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ListSnapshotsInRecycleBinCommand extends ListSnapshotsInRecycleBinCommand_base {
  protected static __types: {
    api: {
      input: ListSnapshotsInRecycleBinRequest;
      output: ListSnapshotsInRecycleBinResult;
    };
    sdk: {
      input: ListSnapshotsInRecycleBinCommandInput;
      output: ListSnapshotsInRecycleBinCommandOutput;
    };
  };
}
