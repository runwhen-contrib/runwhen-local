import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeImageAttributeRequest,
  ImageAttribute,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeImageAttributeCommandInput
  extends DescribeImageAttributeRequest {}
export interface DescribeImageAttributeCommandOutput
  extends ImageAttribute,
    __MetadataBearer {}
declare const DescribeImageAttributeCommand_base: {
  new (
    input: DescribeImageAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImageAttributeCommandInput,
    DescribeImageAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeImageAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeImageAttributeCommandInput,
    DescribeImageAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeImageAttributeCommand extends DescribeImageAttributeCommand_base {
  protected static __types: {
    api: {
      input: DescribeImageAttributeRequest;
      output: ImageAttribute;
    };
    sdk: {
      input: DescribeImageAttributeCommandInput;
      output: DescribeImageAttributeCommandOutput;
    };
  };
}
