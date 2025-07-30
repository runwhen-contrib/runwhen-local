import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateTransitGatewayRouteTableRequest,
  AssociateTransitGatewayRouteTableResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateTransitGatewayRouteTableCommandInput
  extends AssociateTransitGatewayRouteTableRequest {}
export interface AssociateTransitGatewayRouteTableCommandOutput
  extends AssociateTransitGatewayRouteTableResult,
    __MetadataBearer {}
declare const AssociateTransitGatewayRouteTableCommand_base: {
  new (
    input: AssociateTransitGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTransitGatewayRouteTableCommandInput,
    AssociateTransitGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateTransitGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTransitGatewayRouteTableCommandInput,
    AssociateTransitGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateTransitGatewayRouteTableCommand extends AssociateTransitGatewayRouteTableCommand_base {
  protected static __types: {
    api: {
      input: AssociateTransitGatewayRouteTableRequest;
      output: AssociateTransitGatewayRouteTableResult;
    };
    sdk: {
      input: AssociateTransitGatewayRouteTableCommandInput;
      output: AssociateTransitGatewayRouteTableCommandOutput;
    };
  };
}
