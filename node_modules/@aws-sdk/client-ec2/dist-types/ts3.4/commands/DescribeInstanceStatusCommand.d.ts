import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceStatusRequest,
  DescribeInstanceStatusResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceStatusCommandInput
  extends DescribeInstanceStatusRequest {}
export interface DescribeInstanceStatusCommandOutput
  extends DescribeInstanceStatusResult,
    __MetadataBearer {}
declare const DescribeInstanceStatusCommand_base: {
  new (
    input: DescribeInstanceStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceStatusCommandInput,
    DescribeInstanceStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceStatusCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceStatusCommandInput,
    DescribeInstanceStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceStatusCommand extends DescribeInstanceStatusCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceStatusRequest;
      output: DescribeInstanceStatusResult;
    };
    sdk: {
      input: DescribeInstanceStatusCommandInput;
      output: DescribeInstanceStatusCommandOutput;
    };
  };
}
