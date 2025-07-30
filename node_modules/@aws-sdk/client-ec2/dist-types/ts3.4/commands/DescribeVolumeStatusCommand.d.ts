import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVolumeStatusRequest,
  DescribeVolumeStatusResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVolumeStatusCommandInput
  extends DescribeVolumeStatusRequest {}
export interface DescribeVolumeStatusCommandOutput
  extends DescribeVolumeStatusResult,
    __MetadataBearer {}
declare const DescribeVolumeStatusCommand_base: {
  new (
    input: DescribeVolumeStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumeStatusCommandInput,
    DescribeVolumeStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVolumeStatusCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumeStatusCommandInput,
    DescribeVolumeStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVolumeStatusCommand extends DescribeVolumeStatusCommand_base {
  protected static __types: {
    api: {
      input: DescribeVolumeStatusRequest;
      output: DescribeVolumeStatusResult;
    };
    sdk: {
      input: DescribeVolumeStatusCommandInput;
      output: DescribeVolumeStatusCommandOutput;
    };
  };
}
