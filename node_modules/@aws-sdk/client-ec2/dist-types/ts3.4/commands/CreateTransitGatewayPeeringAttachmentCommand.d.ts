import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayPeeringAttachmentRequest,
  CreateTransitGatewayPeeringAttachmentResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayPeeringAttachmentCommandInput
  extends CreateTransitGatewayPeeringAttachmentRequest {}
export interface CreateTransitGatewayPeeringAttachmentCommandOutput
  extends CreateTransitGatewayPeeringAttachmentResult,
    __MetadataBearer {}
declare const CreateTransitGatewayPeeringAttachmentCommand_base: {
  new (
    input: CreateTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayPeeringAttachmentCommandInput,
    CreateTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayPeeringAttachmentCommandInput,
    CreateTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayPeeringAttachmentCommand extends CreateTransitGatewayPeeringAttachmentCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayPeeringAttachmentRequest;
      output: CreateTransitGatewayPeeringAttachmentResult;
    };
    sdk: {
      input: CreateTransitGatewayPeeringAttachmentCommandInput;
      output: CreateTransitGatewayPeeringAttachmentCommandOutput;
    };
  };
}
