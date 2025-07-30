import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcAttributeRequest,
  DescribeVpcAttributeResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcAttributeCommandInput
  extends DescribeVpcAttributeRequest {}
export interface DescribeVpcAttributeCommandOutput
  extends DescribeVpcAttributeResult,
    __MetadataBearer {}
declare const DescribeVpcAttributeCommand_base: {
  new (
    input: DescribeVpcAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcAttributeCommandInput,
    DescribeVpcAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeVpcAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcAttributeCommandInput,
    DescribeVpcAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcAttributeCommand extends DescribeVpcAttributeCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcAttributeRequest;
      output: DescribeVpcAttributeResult;
    };
    sdk: {
      input: DescribeVpcAttributeCommandInput;
      output: DescribeVpcAttributeCommandOutput;
    };
  };
}
