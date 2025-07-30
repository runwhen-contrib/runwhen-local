import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayRouteRequest,
  CreateTransitGatewayRouteResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayRouteCommandInput
  extends CreateTransitGatewayRouteRequest {}
export interface CreateTransitGatewayRouteCommandOutput
  extends CreateTransitGatewayRouteResult,
    __MetadataBearer {}
declare const CreateTransitGatewayRouteCommand_base: {
  new (
    input: CreateTransitGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayRouteCommandInput,
    CreateTransitGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayRouteCommandInput,
    CreateTransitGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayRouteCommand extends CreateTransitGatewayRouteCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayRouteRequest;
      output: CreateTransitGatewayRouteResult;
    };
    sdk: {
      input: CreateTransitGatewayRouteCommandInput;
      output: CreateTransitGatewayRouteCommandOutput;
    };
  };
}
