import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeRegionsRequest,
  DescribeRegionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeRegionsCommandInput extends DescribeRegionsRequest {}
export interface DescribeRegionsCommandOutput
  extends DescribeRegionsResult,
    __MetadataBearer {}
declare const DescribeRegionsCommand_base: {
  new (
    input: DescribeRegionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRegionsCommandInput,
    DescribeRegionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeRegionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRegionsCommandInput,
    DescribeRegionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeRegionsCommand extends DescribeRegionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeRegionsRequest;
      output: DescribeRegionsResult;
    };
    sdk: {
      input: DescribeRegionsCommandInput;
      output: DescribeRegionsCommandOutput;
    };
  };
}
