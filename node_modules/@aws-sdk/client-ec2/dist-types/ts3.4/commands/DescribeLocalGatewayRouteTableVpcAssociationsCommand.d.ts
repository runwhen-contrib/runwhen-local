import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLocalGatewayRouteTableVpcAssociationsRequest,
  DescribeLocalGatewayRouteTableVpcAssociationsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLocalGatewayRouteTableVpcAssociationsCommandInput
  extends DescribeLocalGatewayRouteTableVpcAssociationsRequest {}
export interface DescribeLocalGatewayRouteTableVpcAssociationsCommandOutput
  extends DescribeLocalGatewayRouteTableVpcAssociationsResult,
    __MetadataBearer {}
declare const DescribeLocalGatewayRouteTableVpcAssociationsCommand_base: {
  new (
    input: DescribeLocalGatewayRouteTableVpcAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayRouteTableVpcAssociationsCommandInput,
    DescribeLocalGatewayRouteTableVpcAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLocalGatewayRouteTableVpcAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayRouteTableVpcAssociationsCommandInput,
    DescribeLocalGatewayRouteTableVpcAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLocalGatewayRouteTableVpcAssociationsCommand extends DescribeLocalGatewayRouteTableVpcAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeLocalGatewayRouteTableVpcAssociationsRequest;
      output: DescribeLocalGatewayRouteTableVpcAssociationsResult;
    };
    sdk: {
      input: DescribeLocalGatewayRouteTableVpcAssociationsCommandInput;
      output: DescribeLocalGatewayRouteTableVpcAssociationsCommandOutput;
    };
  };
}
