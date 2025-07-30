import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayRouteTablesRequest,
  DescribeTransitGatewayRouteTablesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayRouteTablesCommandInput
  extends DescribeTransitGatewayRouteTablesRequest {}
export interface DescribeTransitGatewayRouteTablesCommandOutput
  extends DescribeTransitGatewayRouteTablesResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayRouteTablesCommand_base: {
  new (
    input: DescribeTransitGatewayRouteTablesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayRouteTablesCommandInput,
    DescribeTransitGatewayRouteTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayRouteTablesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayRouteTablesCommandInput,
    DescribeTransitGatewayRouteTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayRouteTablesCommand extends DescribeTransitGatewayRouteTablesCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayRouteTablesRequest;
      output: DescribeTransitGatewayRouteTablesResult;
    };
    sdk: {
      input: DescribeTransitGatewayRouteTablesCommandInput;
      output: DescribeTransitGatewayRouteTablesCommandOutput;
    };
  };
}
