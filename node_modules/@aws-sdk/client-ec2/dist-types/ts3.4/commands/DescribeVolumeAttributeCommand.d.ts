import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVolumeAttributeRequest,
  DescribeVolumeAttributeResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVolumeAttributeCommandInput
  extends DescribeVolumeAttributeRequest {}
export interface DescribeVolumeAttributeCommandOutput
  extends DescribeVolumeAttributeResult,
    __MetadataBearer {}
declare const DescribeVolumeAttributeCommand_base: {
  new (
    input: DescribeVolumeAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumeAttributeCommandInput,
    DescribeVolumeAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeVolumeAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumeAttributeCommandInput,
    DescribeVolumeAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVolumeAttributeCommand extends DescribeVolumeAttributeCommand_base {
  protected static __types: {
    api: {
      input: DescribeVolumeAttributeRequest;
      output: DescribeVolumeAttributeResult;
    };
    sdk: {
      input: DescribeVolumeAttributeCommandInput;
      output: DescribeVolumeAttributeCommandOutput;
    };
  };
}
