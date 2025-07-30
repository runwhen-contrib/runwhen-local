import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeRouteServerEndpointsRequest,
  DescribeRouteServerEndpointsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeRouteServerEndpointsCommandInput
  extends DescribeRouteServerEndpointsRequest {}
export interface DescribeRouteServerEndpointsCommandOutput
  extends DescribeRouteServerEndpointsResult,
    __MetadataBearer {}
declare const DescribeRouteServerEndpointsCommand_base: {
  new (
    input: DescribeRouteServerEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteServerEndpointsCommandInput,
    DescribeRouteServerEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeRouteServerEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteServerEndpointsCommandInput,
    DescribeRouteServerEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeRouteServerEndpointsCommand extends DescribeRouteServerEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeRouteServerEndpointsRequest;
      output: DescribeRouteServerEndpointsResult;
    };
    sdk: {
      input: DescribeRouteServerEndpointsCommandInput;
      output: DescribeRouteServerEndpointsCommandOutput;
    };
  };
}
