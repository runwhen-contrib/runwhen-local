import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayRouteTableAnnouncementRequest,
  DeleteTransitGatewayRouteTableAnnouncementResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayRouteTableAnnouncementCommandInput
  extends DeleteTransitGatewayRouteTableAnnouncementRequest {}
export interface DeleteTransitGatewayRouteTableAnnouncementCommandOutput
  extends DeleteTransitGatewayRouteTableAnnouncementResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayRouteTableAnnouncementCommand_base: {
  new (
    input: DeleteTransitGatewayRouteTableAnnouncementCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayRouteTableAnnouncementCommandInput,
    DeleteTransitGatewayRouteTableAnnouncementCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayRouteTableAnnouncementCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayRouteTableAnnouncementCommandInput,
    DeleteTransitGatewayRouteTableAnnouncementCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayRouteTableAnnouncementCommand extends DeleteTransitGatewayRouteTableAnnouncementCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayRouteTableAnnouncementRequest;
      output: DeleteTransitGatewayRouteTableAnnouncementResult;
    };
    sdk: {
      input: DeleteTransitGatewayRouteTableAnnouncementCommandInput;
      output: DeleteTransitGatewayRouteTableAnnouncementCommandOutput;
    };
  };
}
