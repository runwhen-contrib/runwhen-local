import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyTransitGatewayVpcAttachmentRequest,
  ModifyTransitGatewayVpcAttachmentResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyTransitGatewayVpcAttachmentCommandInput
  extends ModifyTransitGatewayVpcAttachmentRequest {}
export interface ModifyTransitGatewayVpcAttachmentCommandOutput
  extends ModifyTransitGatewayVpcAttachmentResult,
    __MetadataBearer {}
declare const ModifyTransitGatewayVpcAttachmentCommand_base: {
  new (
    input: ModifyTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTransitGatewayVpcAttachmentCommandInput,
    ModifyTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTransitGatewayVpcAttachmentCommandInput,
    ModifyTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTransitGatewayVpcAttachmentCommand extends ModifyTransitGatewayVpcAttachmentCommand_base {
  protected static __types: {
    api: {
      input: ModifyTransitGatewayVpcAttachmentRequest;
      output: ModifyTransitGatewayVpcAttachmentResult;
    };
    sdk: {
      input: ModifyTransitGatewayVpcAttachmentCommandInput;
      output: ModifyTransitGatewayVpcAttachmentCommandOutput;
    };
  };
}
