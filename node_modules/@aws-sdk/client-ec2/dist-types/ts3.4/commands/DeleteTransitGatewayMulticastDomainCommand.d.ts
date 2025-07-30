import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayMulticastDomainRequest,
  DeleteTransitGatewayMulticastDomainResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayMulticastDomainCommandInput
  extends DeleteTransitGatewayMulticastDomainRequest {}
export interface DeleteTransitGatewayMulticastDomainCommandOutput
  extends DeleteTransitGatewayMulticastDomainResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayMulticastDomainCommand_base: {
  new (
    input: DeleteTransitGatewayMulticastDomainCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayMulticastDomainCommandInput,
    DeleteTransitGatewayMulticastDomainCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayMulticastDomainCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayMulticastDomainCommandInput,
    DeleteTransitGatewayMulticastDomainCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayMulticastDomainCommand extends DeleteTransitGatewayMulticastDomainCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayMulticastDomainRequest;
      output: DeleteTransitGatewayMulticastDomainResult;
    };
    sdk: {
      input: DeleteTransitGatewayMulticastDomainCommandInput;
      output: DeleteTransitGatewayMulticastDomainCommandOutput;
    };
  };
}
