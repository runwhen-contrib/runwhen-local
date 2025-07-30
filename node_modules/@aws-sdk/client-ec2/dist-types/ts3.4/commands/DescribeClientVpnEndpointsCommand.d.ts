import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeClientVpnEndpointsRequest,
  DescribeClientVpnEndpointsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeClientVpnEndpointsCommandInput
  extends DescribeClientVpnEndpointsRequest {}
export interface DescribeClientVpnEndpointsCommandOutput
  extends DescribeClientVpnEndpointsResult,
    __MetadataBearer {}
declare const DescribeClientVpnEndpointsCommand_base: {
  new (
    input: DescribeClientVpnEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnEndpointsCommandInput,
    DescribeClientVpnEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeClientVpnEndpointsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnEndpointsCommandInput,
    DescribeClientVpnEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeClientVpnEndpointsCommand extends DescribeClientVpnEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DescribeClientVpnEndpointsRequest;
      output: DescribeClientVpnEndpointsResult;
    };
    sdk: {
      input: DescribeClientVpnEndpointsCommandInput;
      output: DescribeClientVpnEndpointsCommandOutput;
    };
  };
}
