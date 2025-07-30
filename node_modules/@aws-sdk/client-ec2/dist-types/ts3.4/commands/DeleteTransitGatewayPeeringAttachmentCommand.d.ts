import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayPeeringAttachmentRequest,
  DeleteTransitGatewayPeeringAttachmentResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayPeeringAttachmentCommandInput
  extends DeleteTransitGatewayPeeringAttachmentRequest {}
export interface DeleteTransitGatewayPeeringAttachmentCommandOutput
  extends DeleteTransitGatewayPeeringAttachmentResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayPeeringAttachmentCommand_base: {
  new (
    input: DeleteTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayPeeringAttachmentCommandInput,
    DeleteTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayPeeringAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayPeeringAttachmentCommandInput,
    DeleteTransitGatewayPeeringAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayPeeringAttachmentCommand extends DeleteTransitGatewayPeeringAttachmentCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayPeeringAttachmentRequest;
      output: DeleteTransitGatewayPeeringAttachmentResult;
    };
    sdk: {
      input: DeleteTransitGatewayPeeringAttachmentCommandInput;
      output: DeleteTransitGatewayPeeringAttachmentCommandOutput;
    };
  };
}
