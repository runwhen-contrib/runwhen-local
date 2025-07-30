import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceAttributeRequest,
  InstanceAttribute,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceAttributeCommandInput
  extends DescribeInstanceAttributeRequest {}
export interface DescribeInstanceAttributeCommandOutput
  extends InstanceAttribute,
    __MetadataBearer {}
declare const DescribeInstanceAttributeCommand_base: {
  new (
    input: DescribeInstanceAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceAttributeCommandInput,
    DescribeInstanceAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeInstanceAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceAttributeCommandInput,
    DescribeInstanceAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceAttributeCommand extends DescribeInstanceAttributeCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceAttributeRequest;
      output: InstanceAttribute;
    };
    sdk: {
      input: DescribeInstanceAttributeCommandInput;
      output: DescribeInstanceAttributeCommandOutput;
    };
  };
}
