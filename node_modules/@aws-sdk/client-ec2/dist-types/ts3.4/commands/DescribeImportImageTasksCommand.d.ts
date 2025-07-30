import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeImportImageTasksRequest,
  DescribeImportImageTasksResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeImportImageTasksCommandInput
  extends DescribeImportImageTasksRequest {}
export interface DescribeImportImageTasksCommandOutput
  extends DescribeImportImageTasksResult,
    __MetadataBearer {}
declare const DescribeImportImageTasksCommand_base: {
  new (
    input: DescribeImportImageTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImportImageTasksCommandInput,
    DescribeImportImageTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeImportImageTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImportImageTasksCommandInput,
    DescribeImportImageTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeImportImageTasksCommand extends DescribeImportImageTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeImportImageTasksRequest;
      output: DescribeImportImageTasksResult;
    };
    sdk: {
      input: DescribeImportImageTasksCommandInput;
      output: DescribeImportImageTasksCommandOutput;
    };
  };
}
