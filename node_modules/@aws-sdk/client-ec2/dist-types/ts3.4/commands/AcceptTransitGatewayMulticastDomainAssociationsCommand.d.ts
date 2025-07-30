import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptTransitGatewayMulticastDomainAssociationsRequest,
  AcceptTransitGatewayMulticastDomainAssociationsResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptTransitGatewayMulticastDomainAssociationsCommandInput
  extends AcceptTransitGatewayMulticastDomainAssociationsRequest {}
export interface AcceptTransitGatewayMulticastDomainAssociationsCommandOutput
  extends AcceptTransitGatewayMulticastDomainAssociationsResult,
    __MetadataBearer {}
declare const AcceptTransitGatewayMulticastDomainAssociationsCommand_base: {
  new (
    input: AcceptTransitGatewayMulticastDomainAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptTransitGatewayMulticastDomainAssociationsCommandInput,
    AcceptTransitGatewayMulticastDomainAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [AcceptTransitGatewayMulticastDomainAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptTransitGatewayMulticastDomainAssociationsCommandInput,
    AcceptTransitGatewayMulticastDomainAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptTransitGatewayMulticastDomainAssociationsCommand extends AcceptTransitGatewayMulticastDomainAssociationsCommand_base {
  protected static __types: {
    api: {
      input: AcceptTransitGatewayMulticastDomainAssociationsRequest;
      output: AcceptTransitGatewayMulticastDomainAssociationsResult;
    };
    sdk: {
      input: AcceptTransitGatewayMulticastDomainAssociationsCommandInput;
      output: AcceptTransitGatewayMulticastDomainAssociationsCommandOutput;
    };
  };
}
