import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLocalGatewayRouteTablesRequest,
  DescribeLocalGatewayRouteTablesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLocalGatewayRouteTablesCommandInput
  extends DescribeLocalGatewayRouteTablesRequest {}
export interface DescribeLocalGatewayRouteTablesCommandOutput
  extends DescribeLocalGatewayRouteTablesResult,
    __MetadataBearer {}
declare const DescribeLocalGatewayRouteTablesCommand_base: {
  new (
    input: DescribeLocalGatewayRouteTablesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayRouteTablesCommandInput,
    DescribeLocalGatewayRouteTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLocalGatewayRouteTablesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayRouteTablesCommandInput,
    DescribeLocalGatewayRouteTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLocalGatewayRouteTablesCommand extends DescribeLocalGatewayRouteTablesCommand_base {
  protected static __types: {
    api: {
      input: DescribeLocalGatewayRouteTablesRequest;
      output: DescribeLocalGatewayRouteTablesResult;
    };
    sdk: {
      input: DescribeLocalGatewayRouteTablesCommandInput;
      output: DescribeLocalGatewayRouteTablesCommandOutput;
    };
  };
}
