import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeExportTasksRequest,
  DescribeExportTasksResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeExportTasksCommandInput
  extends DescribeExportTasksRequest {}
export interface DescribeExportTasksCommandOutput
  extends DescribeExportTasksResult,
    __MetadataBearer {}
declare const DescribeExportTasksCommand_base: {
  new (
    input: DescribeExportTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeExportTasksCommandInput,
    DescribeExportTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeExportTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeExportTasksCommandInput,
    DescribeExportTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeExportTasksCommand extends DescribeExportTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeExportTasksRequest;
      output: DescribeExportTasksResult;
    };
    sdk: {
      input: DescribeExportTasksCommandInput;
      output: DescribeExportTasksCommandOutput;
    };
  };
}
