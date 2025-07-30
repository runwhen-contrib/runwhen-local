import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RegisterTransitGatewayMulticastGroupSourcesRequest,
  RegisterTransitGatewayMulticastGroupSourcesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RegisterTransitGatewayMulticastGroupSourcesCommandInput
  extends RegisterTransitGatewayMulticastGroupSourcesRequest {}
export interface RegisterTransitGatewayMulticastGroupSourcesCommandOutput
  extends RegisterTransitGatewayMulticastGroupSourcesResult,
    __MetadataBearer {}
declare const RegisterTransitGatewayMulticastGroupSourcesCommand_base: {
  new (
    input: RegisterTransitGatewayMulticastGroupSourcesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterTransitGatewayMulticastGroupSourcesCommandInput,
    RegisterTransitGatewayMulticastGroupSourcesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RegisterTransitGatewayMulticastGroupSourcesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterTransitGatewayMulticastGroupSourcesCommandInput,
    RegisterTransitGatewayMulticastGroupSourcesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RegisterTransitGatewayMulticastGroupSourcesCommand extends RegisterTransitGatewayMulticastGroupSourcesCommand_base {
  protected static __types: {
    api: {
      input: RegisterTransitGatewayMulticastGroupSourcesRequest;
      output: RegisterTransitGatewayMulticastGroupSourcesResult;
    };
    sdk: {
      input: RegisterTransitGatewayMulticastGroupSourcesCommandInput;
      output: RegisterTransitGatewayMulticastGroupSourcesCommandOutput;
    };
  };
}
