import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RejectTransitGatewayPeeringAttachmentRequest,
  RejectTransitGatewayPeeringAttachmentResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RejectTransitGatewayPeeringAttachmentCommandInput
  extends RejectTransitGatewayPeeringAttachmentRequest {}
export interface RejectTransitGatewayPeeringAttachmentCommandOutput
  extends RejectTransitGatewayPeeringAttachmentResult,
    __MetadataBearer {}
declare const RejectTransitGatewayPeeringAttachmentCommand_base: {
  new (
    input: RejectTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectTransitGatewayPeeringAttachmentCommandInput,
    RejectTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RejectTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectTransitGatewayPeeringAttachmentCommandInput,
    RejectTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RejectTransitGatewayPeeringAttachmentCommand extends RejectTransitGatewayPeeringAttachmentCommand_base {
  protected static __types: {
    api: {
      input: RejectTransitGatewayPeeringAttachmentRequest;
      output: RejectTransitGatewayPeeringAttachmentResult;
    };
    sdk: {
      input: RejectTransitGatewayPeeringAttachmentCommandInput;
      output: RejectTransitGatewayPeeringAttachmentCommandOutput;
    };
  };
}
