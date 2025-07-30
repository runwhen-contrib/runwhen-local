import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeregisterTransitGatewayMulticastGroupMembersRequest,
  DeregisterTransitGatewayMulticastGroupMembersResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeregisterTransitGatewayMulticastGroupMembersCommandInput
  extends DeregisterTransitGatewayMulticastGroupMembersRequest {}
export interface DeregisterTransitGatewayMulticastGroupMembersCommandOutput
  extends DeregisterTransitGatewayMulticastGroupMembersResult,
    __MetadataBearer {}
declare const DeregisterTransitGatewayMulticastGroupMembersCommand_base: {
  new (
    input: DeregisterTransitGatewayMulticastGroupMembersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterTransitGatewayMulticastGroupMembersCommandInput,
    DeregisterTransitGatewayMulticastGroupMembersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeregisterTransitGatewayMulticastGroupMembersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterTransitGatewayMulticastGroupMembersCommandInput,
    DeregisterTransitGatewayMulticastGroupMembersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeregisterTransitGatewayMulticastGroupMembersCommand extends DeregisterTransitGatewayMulticastGroupMembersCommand_base {
  protected static __types: {
    api: {
      input: DeregisterTransitGatewayMulticastGroupMembersRequest;
      output: DeregisterTransitGatewayMulticastGroupMembersResult;
    };
    sdk: {
      input: DeregisterTransitGatewayMulticastGroupMembersCommandInput;
      output: DeregisterTransitGatewayMulticastGroupMembersCommandOutput;
    };
  };
}
