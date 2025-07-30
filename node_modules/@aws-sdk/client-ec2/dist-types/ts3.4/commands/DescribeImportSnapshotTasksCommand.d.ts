import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeImportSnapshotTasksRequest,
  DescribeImportSnapshotTasksResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeImportSnapshotTasksCommandInput
  extends DescribeImportSnapshotTasksRequest {}
export interface DescribeImportSnapshotTasksCommandOutput
  extends DescribeImportSnapshotTasksResult,
    __MetadataBearer {}
declare const DescribeImportSnapshotTasksCommand_base: {
  new (
    input: DescribeImportSnapshotTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImportSnapshotTasksCommandInput,
    DescribeImportSnapshotTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeImportSnapshotTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImportSnapshotTasksCommandInput,
    DescribeImportSnapshotTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeImportSnapshotTasksCommand extends DescribeImportSnapshotTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeImportSnapshotTasksRequest;
      output: DescribeImportSnapshotTasksResult;
    };
    sdk: {
      input: DescribeImportSnapshotTasksCommandInput;
      output: DescribeImportSnapshotTasksCommandOutput;
    };
  };
}
