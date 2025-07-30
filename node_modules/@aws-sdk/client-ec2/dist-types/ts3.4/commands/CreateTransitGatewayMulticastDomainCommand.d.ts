import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayMulticastDomainRequest,
  CreateTransitGatewayMulticastDomainResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayMulticastDomainCommandInput
  extends CreateTransitGatewayMulticastDomainRequest {}
export interface CreateTransitGatewayMulticastDomainCommandOutput
  extends CreateTransitGatewayMulticastDomainResult,
    __MetadataBearer {}
declare const CreateTransitGatewayMulticastDomainCommand_base: {
  new (
    input: CreateTransitGatewayMulticastDomainCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayMulticastDomainCommandInput,
    CreateTransitGatewayMulticastDomainCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayMulticastDomainCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayMulticastDomainCommandInput,
    CreateTransitGatewayMulticastDomainCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayMulticastDomainCommand extends CreateTransitGatewayMulticastDomainCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayMulticastDomainRequest;
      output: CreateTransitGatewayMulticastDomainResult;
    };
    sdk: {
      input: CreateTransitGatewayMulticastDomainCommandInput;
      output: CreateTransitGatewayMulticastDomainCommandOutput;
    };
  };
}
