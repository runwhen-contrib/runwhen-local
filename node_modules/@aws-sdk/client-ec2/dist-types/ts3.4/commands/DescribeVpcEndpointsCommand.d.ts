import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointsRequest,
  DescribeVpcEndpointsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointsCommandInput
  extends DescribeVpcEndpointsRequest {}
export interface DescribeVpcEndpointsCommandOutput
  extends DescribeVpcEndpointsResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointsCommand_base: {
  new (
    input: DescribeVpcEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointsCommandInput,
    DescribeVpcEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointsCommandInput,
    DescribeVpcEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointsCommand extends DescribeVpcEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointsRequest;
      output: DescribeVpcEndpointsResult;
    };
    sdk: {
      input: DescribeVpcEndpointsCommandInput;
      output: DescribeVpcEndpointsCommandOutput;
    };
  };
}
