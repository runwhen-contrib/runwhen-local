import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayRouteTableAssociationsRequest,
  GetTransitGatewayRouteTableAssociationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayRouteTableAssociationsCommandInput
  extends GetTransitGatewayRouteTableAssociationsRequest {}
export interface GetTransitGatewayRouteTableAssociationsCommandOutput
  extends GetTransitGatewayRouteTableAssociationsResult,
    __MetadataBearer {}
declare const GetTransitGatewayRouteTableAssociationsCommand_base: {
  new (
    input: GetTransitGatewayRouteTableAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayRouteTableAssociationsCommandInput,
    GetTransitGatewayRouteTableAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayRouteTableAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayRouteTableAssociationsCommandInput,
    GetTransitGatewayRouteTableAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayRouteTableAssociationsCommand extends GetTransitGatewayRouteTableAssociationsCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayRouteTableAssociationsRequest;
      output: GetTransitGatewayRouteTableAssociationsResult;
    };
    sdk: {
      input: GetTransitGatewayRouteTableAssociationsCommandInput;
      output: GetTransitGatewayRouteTableAssociationsCommandOutput;
    };
  };
}
