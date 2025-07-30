import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceEventWindowsRequest,
  DescribeInstanceEventWindowsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceEventWindowsCommandInput
  extends DescribeInstanceEventWindowsRequest {}
export interface DescribeInstanceEventWindowsCommandOutput
  extends DescribeInstanceEventWindowsResult,
    __MetadataBearer {}
declare const DescribeInstanceEventWindowsCommand_base: {
  new (
    input: DescribeInstanceEventWindowsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceEventWindowsCommandInput,
    DescribeInstanceEventWindowsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceEventWindowsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceEventWindowsCommandInput,
    DescribeInstanceEventWindowsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceEventWindowsCommand extends DescribeInstanceEventWindowsCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceEventWindowsRequest;
      output: DescribeInstanceEventWindowsResult;
    };
    sdk: {
      input: DescribeInstanceEventWindowsCommandInput;
      output: DescribeInstanceEventWindowsCommandOutput;
    };
  };
}
