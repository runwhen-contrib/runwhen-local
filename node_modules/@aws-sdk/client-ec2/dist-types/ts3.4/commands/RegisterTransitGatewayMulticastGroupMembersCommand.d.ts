import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RegisterTransitGatewayMulticastGroupMembersRequest,
  RegisterTransitGatewayMulticastGroupMembersResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RegisterTransitGatewayMulticastGroupMembersCommandInput
  extends RegisterTransitGatewayMulticastGroupMembersRequest {}
export interface RegisterTransitGatewayMulticastGroupMembersCommandOutput
  extends RegisterTransitGatewayMulticastGroupMembersResult,
    __MetadataBearer {}
declare const RegisterTransitGatewayMulticastGroupMembersCommand_base: {
  new (
    input: RegisterTransitGatewayMulticastGroupMembersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterTransitGatewayMulticastGroupMembersCommandInput,
    RegisterTransitGatewayMulticastGroupMembersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RegisterTransitGatewayMulticastGroupMembersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterTransitGatewayMulticastGroupMembersCommandInput,
    RegisterTransitGatewayMulticastGroupMembersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RegisterTransitGatewayMulticastGroupMembersCommand extends RegisterTransitGatewayMulticastGroupMembersCommand_base {
  protected static __types: {
    api: {
      input: RegisterTransitGatewayMulticastGroupMembersRequest;
      output: RegisterTransitGatewayMulticastGroupMembersResult;
    };
    sdk: {
      input: RegisterTransitGatewayMulticastGroupMembersCommandInput;
      output: RegisterTransitGatewayMulticastGroupMembersCommandOutput;
    };
  };
}
