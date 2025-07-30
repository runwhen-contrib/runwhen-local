import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeExportImageTasksRequest,
  DescribeExportImageTasksResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeExportImageTasksCommandInput
  extends DescribeExportImageTasksRequest {}
export interface DescribeExportImageTasksCommandOutput
  extends DescribeExportImageTasksResult,
    __MetadataBearer {}
declare const DescribeExportImageTasksCommand_base: {
  new (
    input: DescribeExportImageTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeExportImageTasksCommandInput,
    DescribeExportImageTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeExportImageTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeExportImageTasksCommandInput,
    DescribeExportImageTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeExportImageTasksCommand extends DescribeExportImageTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeExportImageTasksRequest;
      output: DescribeExportImageTasksResult;
    };
    sdk: {
      input: DescribeExportImageTasksCommandInput;
      output: DescribeExportImageTasksCommandOutput;
    };
  };
}
