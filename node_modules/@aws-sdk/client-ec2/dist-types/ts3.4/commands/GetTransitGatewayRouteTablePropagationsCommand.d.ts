import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayRouteTablePropagationsRequest,
  GetTransitGatewayRouteTablePropagationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayRouteTablePropagationsCommandInput
  extends GetTransitGatewayRouteTablePropagationsRequest {}
export interface GetTransitGatewayRouteTablePropagationsCommandOutput
  extends GetTransitGatewayRouteTablePropagationsResult,
    __MetadataBearer {}
declare const GetTransitGatewayRouteTablePropagationsCommand_base: {
  new (
    input: GetTransitGatewayRouteTablePropagationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayRouteTablePropagationsCommandInput,
    GetTransitGatewayRouteTablePropagationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayRouteTablePropagationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayRouteTablePropagationsCommandInput,
    GetTransitGatewayRouteTablePropagationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayRouteTablePropagationsCommand extends GetTransitGatewayRouteTablePropagationsCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayRouteTablePropagationsRequest;
      output: GetTransitGatewayRouteTablePropagationsResult;
    };
    sdk: {
      input: GetTransitGatewayRouteTablePropagationsCommandInput;
      output: GetTransitGatewayRouteTablePropagationsCommandOutput;
    };
  };
}
