import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayAttachmentPropagationsRequest,
  GetTransitGatewayAttachmentPropagationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayAttachmentPropagationsCommandInput
  extends GetTransitGatewayAttachmentPropagationsRequest {}
export interface GetTransitGatewayAttachmentPropagationsCommandOutput
  extends GetTransitGatewayAttachmentPropagationsResult,
    __MetadataBearer {}
declare const GetTransitGatewayAttachmentPropagationsCommand_base: {
  new (
    input: GetTransitGatewayAttachmentPropagationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayAttachmentPropagationsCommandInput,
    GetTransitGatewayAttachmentPropagationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayAttachmentPropagationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayAttachmentPropagationsCommandInput,
    GetTransitGatewayAttachmentPropagationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayAttachmentPropagationsCommand extends GetTransitGatewayAttachmentPropagationsCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayAttachmentPropagationsRequest;
      output: GetTransitGatewayAttachmentPropagationsResult;
    };
    sdk: {
      input: GetTransitGatewayAttachmentPropagationsCommandInput;
      output: GetTransitGatewayAttachmentPropagationsCommandOutput;
    };
  };
}
