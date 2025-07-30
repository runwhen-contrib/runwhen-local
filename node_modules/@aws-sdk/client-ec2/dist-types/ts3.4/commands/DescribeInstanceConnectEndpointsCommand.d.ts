import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceConnectEndpointsRequest,
  DescribeInstanceConnectEndpointsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceConnectEndpointsCommandInput
  extends DescribeInstanceConnectEndpointsRequest {}
export interface DescribeInstanceConnectEndpointsCommandOutput
  extends DescribeInstanceConnectEndpointsResult,
    __MetadataBearer {}
declare const DescribeInstanceConnectEndpointsCommand_base: {
  new (
    input: DescribeInstanceConnectEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceConnectEndpointsCommandInput,
    DescribeInstanceConnectEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceConnectEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceConnectEndpointsCommandInput,
    DescribeInstanceConnectEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceConnectEndpointsCommand extends DescribeInstanceConnectEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceConnectEndpointsRequest;
      output: DescribeInstanceConnectEndpointsResult;
    };
    sdk: {
      input: DescribeInstanceConnectEndpointsCommandInput;
      output: DescribeInstanceConnectEndpointsCommandOutput;
    };
  };
}
