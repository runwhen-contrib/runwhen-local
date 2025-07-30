import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayRouteTableRequest,
  CreateTransitGatewayRouteTableResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayRouteTableCommandInput
  extends CreateTransitGatewayRouteTableRequest {}
export interface CreateTransitGatewayRouteTableCommandOutput
  extends CreateTransitGatewayRouteTableResult,
    __MetadataBearer {}
declare const CreateTransitGatewayRouteTableCommand_base: {
  new (
    input: CreateTransitGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayRouteTableCommandInput,
    CreateTransitGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayRouteTableCommandInput,
    CreateTransitGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayRouteTableCommand extends CreateTransitGatewayRouteTableCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayRouteTableRequest;
      output: CreateTransitGatewayRouteTableResult;
    };
    sdk: {
      input: CreateTransitGatewayRouteTableCommandInput;
      output: CreateTransitGatewayRouteTableCommandOutput;
    };
  };
}
