import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayVpcAttachmentRequest,
  DeleteTransitGatewayVpcAttachmentResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayVpcAttachmentCommandInput
  extends DeleteTransitGatewayVpcAttachmentRequest {}
export interface DeleteTransitGatewayVpcAttachmentCommandOutput
  extends DeleteTransitGatewayVpcAttachmentResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayVpcAttachmentCommand_base: {
  new (
    input: DeleteTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayVpcAttachmentCommandInput,
    DeleteTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayVpcAttachmentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayVpcAttachmentCommandInput,
    DeleteTransitGatewayVpcAttachmentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayVpcAttachmentCommand extends DeleteTransitGatewayVpcAttachmentCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayVpcAttachmentRequest;
      output: DeleteTransitGatewayVpcAttachmentResult;
    };
    sdk: {
      input: DeleteTransitGatewayVpcAttachmentCommandInput;
      output: DeleteTransitGatewayVpcAttachmentCommandOutput;
    };
  };
}
