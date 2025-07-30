import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RejectTransitGatewayMulticastDomainAssociationsRequest,
  RejectTransitGatewayMulticastDomainAssociationsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RejectTransitGatewayMulticastDomainAssociationsCommandInput
  extends RejectTransitGatewayMulticastDomainAssociationsRequest {}
export interface RejectTransitGatewayMulticastDomainAssociationsCommandOutput
  extends RejectTransitGatewayMulticastDomainAssociationsResult,
    __MetadataBearer {}
declare const RejectTransitGatewayMulticastDomainAssociationsCommand_base: {
  new (
    input: RejectTransitGatewayMulticastDomainAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectTransitGatewayMulticastDomainAssociationsCommandInput,
    RejectTransitGatewayMulticastDomainAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [RejectTransitGatewayMulticastDomainAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    RejectTransitGatewayMulticastDomainAssociationsCommandInput,
    RejectTransitGatewayMulticastDomainAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RejectTransitGatewayMulticastDomainAssociationsCommand extends RejectTransitGatewayMulticastDomainAssociationsCommand_base {
  protected static __types: {
    api: {
      input: RejectTransitGatewayMulticastDomainAssociationsRequest;
      output: RejectTransitGatewayMulticastDomainAssociationsResult;
    };
    sdk: {
      input: RejectTransitGatewayMulticastDomainAssociationsCommandInput;
      output: RejectTransitGatewayMulticastDomainAssociationsCommandOutput;
    };
  };
}
