import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayRouteTableAnnouncementRequest,
  CreateTransitGatewayRouteTableAnnouncementResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayRouteTableAnnouncementCommandInput
  extends CreateTransitGatewayRouteTableAnnouncementRequest {}
export interface CreateTransitGatewayRouteTableAnnouncementCommandOutput
  extends CreateTransitGatewayRouteTableAnnouncementResult,
    __MetadataBearer {}
declare const CreateTransitGatewayRouteTableAnnouncementCommand_base: {
  new (
    input: CreateTransitGatewayRouteTableAnnouncementCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayRouteTableAnnouncementCommandInput,
    CreateTransitGatewayRouteTableAnnouncementCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayRouteTableAnnouncementCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayRouteTableAnnouncementCommandInput,
    CreateTransitGatewayRouteTableAnnouncementCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayRouteTableAnnouncementCommand extends CreateTransitGatewayRouteTableAnnouncementCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayRouteTableAnnouncementRequest;
      output: CreateTransitGatewayRouteTableAnnouncementResult;
    };
    sdk: {
      input: CreateTransitGatewayRouteTableAnnouncementCommandInput;
      output: CreateTransitGatewayRouteTableAnnouncementCommandOutput;
    };
  };
}
