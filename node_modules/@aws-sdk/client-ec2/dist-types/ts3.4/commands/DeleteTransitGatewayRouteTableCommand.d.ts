import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayRouteTableRequest,
  DeleteTransitGatewayRouteTableResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayRouteTableCommandInput
  extends DeleteTransitGatewayRouteTableRequest {}
export interface DeleteTransitGatewayRouteTableCommandOutput
  extends DeleteTransitGatewayRouteTableResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayRouteTableCommand_base: {
  new (
    input: DeleteTransitGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayRouteTableCommandInput,
    DeleteTransitGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayRouteTableCommandInput,
    DeleteTransitGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayRouteTableCommand extends DeleteTransitGatewayRouteTableCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayRouteTableRequest;
      output: DeleteTransitGatewayRouteTableResult;
    };
    sdk: {
      input: DeleteTransitGatewayRouteTableCommandInput;
      output: DeleteTransitGatewayRouteTableCommandOutput;
    };
  };
}
