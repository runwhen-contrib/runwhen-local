import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBSnapshotMessage,
  DescribeDBSnapshotsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBSnapshotsCommandInput
  extends DescribeDBSnapshotsMessage {}
export interface DescribeDBSnapshotsCommandOutput
  extends DBSnapshotMessage,
    __MetadataBearer {}
declare const DescribeDBSnapshotsCommand_base: {
  new (
    input: DescribeDBSnapshotsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSnapshotsCommandInput,
    DescribeDBSnapshotsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBSnapshotsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSnapshotsCommandInput,
    DescribeDBSnapshotsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBSnapshotsCommand extends DescribeDBSnapshotsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBSnapshotsMessage;
      output: DBSnapshotMessage;
    };
    sdk: {
      input: DescribeDBSnapshotsCommandInput;
      output: DescribeDBSnapshotsCommandOutput;
    };
  };
}
