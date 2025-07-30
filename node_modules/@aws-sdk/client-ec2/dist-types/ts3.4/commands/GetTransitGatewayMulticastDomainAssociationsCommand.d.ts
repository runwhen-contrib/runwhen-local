import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayMulticastDomainAssociationsRequest,
  GetTransitGatewayMulticastDomainAssociationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayMulticastDomainAssociationsCommandInput
  extends GetTransitGatewayMulticastDomainAssociationsRequest {}
export interface GetTransitGatewayMulticastDomainAssociationsCommandOutput
  extends GetTransitGatewayMulticastDomainAssociationsResult,
    __MetadataBearer {}
declare const GetTransitGatewayMulticastDomainAssociationsCommand_base: {
  new (
    input: GetTransitGatewayMulticastDomainAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayMulticastDomainAssociationsCommandInput,
    GetTransitGatewayMulticastDomainAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayMulticastDomainAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayMulticastDomainAssociationsCommandInput,
    GetTransitGatewayMulticastDomainAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayMulticastDomainAssociationsCommand extends GetTransitGatewayMulticastDomainAssociationsCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayMulticastDomainAssociationsRequest;
      output: GetTransitGatewayMulticastDomainAssociationsResult;
    };
    sdk: {
      input: GetTransitGatewayMulticastDomainAssociationsCommandInput;
      output: GetTransitGatewayMulticastDomainAssociationsCommandOutput;
    };
  };
}
