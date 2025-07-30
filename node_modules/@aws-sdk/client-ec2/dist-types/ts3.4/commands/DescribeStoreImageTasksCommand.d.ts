import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeStoreImageTasksRequest,
  DescribeStoreImageTasksResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeStoreImageTasksCommandInput
  extends DescribeStoreImageTasksRequest {}
export interface DescribeStoreImageTasksCommandOutput
  extends DescribeStoreImageTasksResult,
    __MetadataBearer {}
declare const DescribeStoreImageTasksCommand_base: {
  new (
    input: DescribeStoreImageTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeStoreImageTasksCommandInput,
    DescribeStoreImageTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeStoreImageTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeStoreImageTasksCommandInput,
    DescribeStoreImageTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeStoreImageTasksCommand extends DescribeStoreImageTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeStoreImageTasksRequest;
      output: DescribeStoreImageTasksResult;
    };
    sdk: {
      input: DescribeStoreImageTasksCommandInput;
      output: DescribeStoreImageTasksCommandOutput;
    };
  };
}
