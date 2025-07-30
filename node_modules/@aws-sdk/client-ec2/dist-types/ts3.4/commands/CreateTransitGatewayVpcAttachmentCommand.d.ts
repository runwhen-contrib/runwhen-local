import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayVpcAttachmentRequest,
  CreateTransitGatewayVpcAttachmentResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayVpcAttachmentCommandInput
  extends CreateTransitGatewayVpcAttachmentRequest {}
export interface CreateTransitGatewayVpcAttachmentCommandOutput
  extends CreateTransitGatewayVpcAttachmentResult,
    __MetadataBearer {}
declare const CreateTransitGatewayVpcAttachmentCommand_base: {
  new (
    input: CreateTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayVpcAttachmentCommandInput,
    CreateTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayVpcAttachmentCommandInput,
    CreateTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayVpcAttachmentCommand extends CreateTransitGatewayVpcAttachmentCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayVpcAttachmentRequest;
      output: CreateTransitGatewayVpcAttachmentResult;
    };
    sdk: {
      input: CreateTransitGatewayVpcAttachmentCommandInput;
      output: CreateTransitGatewayVpcAttachmentCommandOutput;
    };
  };
}
