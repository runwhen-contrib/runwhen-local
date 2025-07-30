import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateTransitGatewayMulticastDomainRequest,
  AssociateTransitGatewayMulticastDomainResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateTransitGatewayMulticastDomainCommandInput
  extends AssociateTransitGatewayMulticastDomainRequest {}
export interface AssociateTransitGatewayMulticastDomainCommandOutput
  extends AssociateTransitGatewayMulticastDomainResult,
    __MetadataBearer {}
declare const AssociateTransitGatewayMulticastDomainCommand_base: {
  new (
    input: AssociateTransitGatewayMulticastDomainCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTransitGatewayMulticastDomainCommandInput,
    AssociateTransitGatewayMulticastDomainCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateTransitGatewayMulticastDomainCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTransitGatewayMulticastDomainCommandInput,
    AssociateTransitGatewayMulticastDomainCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateTransitGatewayMulticastDomainCommand extends AssociateTransitGatewayMulticastDomainCommand_base {
  protected static __types: {
    api: {
      input: AssociateTransitGatewayMulticastDomainRequest;
      output: AssociateTransitGatewayMulticastDomainResult;
    };
    sdk: {
      input: AssociateTransitGatewayMulticastDomainCommandInput;
      output: AssociateTransitGatewayMulticastDomainCommandOutput;
    };
  };
}
