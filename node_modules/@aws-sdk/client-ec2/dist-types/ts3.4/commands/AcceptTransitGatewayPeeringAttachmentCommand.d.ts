import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptTransitGatewayPeeringAttachmentRequest,
  AcceptTransitGatewayPeeringAttachmentResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptTransitGatewayPeeringAttachmentCommandInput
  extends AcceptTransitGatewayPeeringAttachmentRequest {}
export interface AcceptTransitGatewayPeeringAttachmentCommandOutput
  extends AcceptTransitGatewayPeeringAttachmentResult,
    __MetadataBearer {}
declare const AcceptTransitGatewayPeeringAttachmentCommand_base: {
  new (
    input: AcceptTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptTransitGatewayPeeringAttachmentCommandInput,
    AcceptTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptTransitGatewayPeeringAttachmentCommandInput,
    AcceptTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptTransitGatewayPeeringAttachmentCommand extends AcceptTransitGatewayPeeringAttachmentCommand_base {
  protected static __types: {
    api: {
      input: AcceptTransitGatewayPeeringAttachmentRequest;
      output: AcceptTransitGatewayPeeringAttachmentResult;
    };
    sdk: {
      input: AcceptTransitGatewayPeeringAttachmentCommandInput;
      output: AcceptTransitGatewayPeeringAttachmentCommandOutput;
    };
  };
}
