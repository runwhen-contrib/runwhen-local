import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptTransitGatewayVpcAttachmentRequest,
  AcceptTransitGatewayVpcAttachmentResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptTransitGatewayVpcAttachmentCommandInput
  extends AcceptTransitGatewayVpcAttachmentRequest {}
export interface AcceptTransitGatewayVpcAttachmentCommandOutput
  extends AcceptTransitGatewayVpcAttachmentResult,
    __MetadataBearer {}
declare const AcceptTransitGatewayVpcAttachmentCommand_base: {
  new (
    input: AcceptTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptTransitGatewayVpcAttachmentCommandInput,
    AcceptTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptTransitGatewayVpcAttachmentCommandInput,
    AcceptTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptTransitGatewayVpcAttachmentCommand extends AcceptTransitGatewayVpcAttachmentCommand_base {
  protected static __types: {
    api: {
      input: AcceptTransitGatewayVpcAttachmentRequest;
      output: AcceptTransitGatewayVpcAttachmentResult;
    };
    sdk: {
      input: AcceptTransitGatewayVpcAttachmentCommandInput;
      output: AcceptTransitGatewayVpcAttachmentCommandOutput;
    };
  };
}
