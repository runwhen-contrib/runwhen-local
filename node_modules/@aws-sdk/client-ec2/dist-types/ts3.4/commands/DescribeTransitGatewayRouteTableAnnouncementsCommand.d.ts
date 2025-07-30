import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayRouteTableAnnouncementsRequest,
  DescribeTransitGatewayRouteTableAnnouncementsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayRouteTableAnnouncementsCommandInput
  extends DescribeTransitGatewayRouteTableAnnouncementsRequest {}
export interface DescribeTransitGatewayRouteTableAnnouncementsCommandOutput
  extends DescribeTransitGatewayRouteTableAnnouncementsResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayRouteTableAnnouncementsCommand_base: {
  new (
    input: DescribeTransitGatewayRouteTableAnnouncementsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayRouteTableAnnouncementsCommandInput,
    DescribeTransitGatewayRouteTableAnnouncementsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayRouteTableAnnouncementsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayRouteTableAnnouncementsCommandInput,
    DescribeTransitGatewayRouteTableAnnouncementsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayRouteTableAnnouncementsCommand extends DescribeTransitGatewayRouteTableAnnouncementsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayRouteTableAnnouncementsRequest;
      output: DescribeTransitGatewayRouteTableAnnouncementsResult;
    };
    sdk: {
      input: DescribeTransitGatewayRouteTableAnnouncementsCommandInput;
      output: DescribeTransitGatewayRouteTableAnnouncementsCommandOutput;
    };
  };
}
