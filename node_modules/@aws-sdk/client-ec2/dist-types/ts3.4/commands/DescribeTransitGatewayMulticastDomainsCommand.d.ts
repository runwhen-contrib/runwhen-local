import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayMulticastDomainsRequest,
  DescribeTransitGatewayMulticastDomainsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayMulticastDomainsCommandInput
  extends DescribeTransitGatewayMulticastDomainsRequest {}
export interface DescribeTransitGatewayMulticastDomainsCommandOutput
  extends DescribeTransitGatewayMulticastDomainsResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayMulticastDomainsCommand_base: {
  new (
    input: DescribeTransitGatewayMulticastDomainsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayMulticastDomainsCommandInput,
    DescribeTransitGatewayMulticastDomainsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayMulticastDomainsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayMulticastDomainsCommandInput,
    DescribeTransitGatewayMulticastDomainsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayMulticastDomainsCommand extends DescribeTransitGatewayMulticastDomainsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayMulticastDomainsRequest;
      output: DescribeTransitGatewayMulticastDomainsResult;
    };
    sdk: {
      input: DescribeTransitGatewayMulticastDomainsCommandInput;
      output: DescribeTransitGatewayMulticastDomainsCommandOutput;
    };
  };
}
