import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstancesRequest,
  DescribeInstancesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstancesCommandInput
  extends DescribeInstancesRequest {}
export interface DescribeInstancesCommandOutput
  extends DescribeInstancesResult,
    __MetadataBearer {}
declare const DescribeInstancesCommand_base: {
  new (
    input: DescribeInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstancesCommandInput,
    DescribeInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstancesCommandInput,
    DescribeInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstancesCommand extends DescribeInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstancesRequest;
      output: DescribeInstancesResult;
    };
    sdk: {
      input: DescribeInstancesCommandInput;
      output: DescribeInstancesCommandOutput;
    };
  };
}
