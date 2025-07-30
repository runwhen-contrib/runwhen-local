import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RejectTransitGatewayVpcAttachmentRequest,
  RejectTransitGatewayVpcAttachmentResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RejectTransitGatewayVpcAttachmentCommandInput
  extends RejectTransitGatewayVpcAttachmentRequest {}
export interface RejectTransitGatewayVpcAttachmentCommandOutput
  extends RejectTransitGatewayVpcAttachmentResult,
    __MetadataBearer {}
declare const RejectTransitGatewayVpcAttachmentCommand_base: {
  new (
    input: RejectTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectTransitGatewayVpcAttachmentCommandInput,
    RejectTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RejectTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectTransitGatewayVpcAttachmentCommandInput,
    RejectTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RejectTransitGatewayVpcAttachmentCommand extends RejectTransitGatewayVpcAttachmentCommand_base {
  protected static __types: {
    api: {
      input: RejectTransitGatewayVpcAttachmentRequest;
      output: RejectTransitGatewayVpcAttachmentResult;
    };
    sdk: {
      input: RejectTransitGatewayVpcAttachmentCommandInput;
      output: RejectTransitGatewayVpcAttachmentCommandOutput;
    };
  };
}
