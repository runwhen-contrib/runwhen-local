import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSubnetsRequest,
  DescribeSubnetsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSubnetsCommandInput extends DescribeSubnetsRequest {}
export interface DescribeSubnetsCommandOutput
  extends DescribeSubnetsResult,
    __MetadataBearer {}
declare const DescribeSubnetsCommand_base: {
  new (
    input: DescribeSubnetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSubnetsCommandInput,
    DescribeSubnetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSubnetsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSubnetsCommandInput,
    DescribeSubnetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSubnetsCommand extends DescribeSubnetsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSubnetsRequest;
      output: DescribeSubnetsResult;
    };
    sdk: {
      input: DescribeSubnetsCommandInput;
      output: DescribeSubnetsCommandOutput;
    };
  };
}
