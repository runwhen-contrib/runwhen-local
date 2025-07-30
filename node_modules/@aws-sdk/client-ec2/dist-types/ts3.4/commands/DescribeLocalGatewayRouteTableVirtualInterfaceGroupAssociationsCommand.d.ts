import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsRequest,
  DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput
  extends DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsRequest {}
export interface DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandOutput
  extends DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsResult,
    __MetadataBearer {}
declare const DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand_base: {
  new (
    input: DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput,
    DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [
          DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput
        ]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput,
    DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand extends DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsRequest;
      output: DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsResult;
    };
    sdk: {
      input: DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput;
      output: DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandOutput;
    };
  };
}
