import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayRouteRequest,
  DeleteTransitGatewayRouteResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayRouteCommandInput
  extends DeleteTransitGatewayRouteRequest {}
export interface DeleteTransitGatewayRouteCommandOutput
  extends DeleteTransitGatewayRouteResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayRouteCommand_base: {
  new (
    input: DeleteTransitGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayRouteCommandInput,
    DeleteTransitGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayRouteCommandInput,
    DeleteTransitGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayRouteCommand extends DeleteTransitGatewayRouteCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayRouteRequest;
      output: DeleteTransitGatewayRouteResult;
    };
    sdk: {
      input: DeleteTransitGatewayRouteCommandInput;
      output: DeleteTransitGatewayRouteCommandOutput;
    };
  };
}
