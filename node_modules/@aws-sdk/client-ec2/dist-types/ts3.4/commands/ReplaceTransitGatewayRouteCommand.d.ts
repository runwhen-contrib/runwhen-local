import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReplaceTransitGatewayRouteRequest,
  ReplaceTransitGatewayRouteResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceTransitGatewayRouteCommandInput
  extends ReplaceTransitGatewayRouteRequest {}
export interface ReplaceTransitGatewayRouteCommandOutput
  extends ReplaceTransitGatewayRouteResult,
    __MetadataBearer {}
declare const ReplaceTransitGatewayRouteCommand_base: {
  new (
    input: ReplaceTransitGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceTransitGatewayRouteCommandInput,
    ReplaceTransitGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceTransitGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceTransitGatewayRouteCommandInput,
    ReplaceTransitGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceTransitGatewayRouteCommand extends ReplaceTransitGatewayRouteCommand_base {
  protected static __types: {
    api: {
      input: ReplaceTransitGatewayRouteRequest;
      output: ReplaceTransitGatewayRouteResult;
    };
    sdk: {
      input: ReplaceTransitGatewayRouteCommandInput;
      output: ReplaceTransitGatewayRouteCommandOutput;
    };
  };
}
