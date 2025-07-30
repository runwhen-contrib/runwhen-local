import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeregisterTransitGatewayMulticastGroupSourcesRequest,
  DeregisterTransitGatewayMulticastGroupSourcesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeregisterTransitGatewayMulticastGroupSourcesCommandInput
  extends DeregisterTransitGatewayMulticastGroupSourcesRequest {}
export interface DeregisterTransitGatewayMulticastGroupSourcesCommandOutput
  extends DeregisterTransitGatewayMulticastGroupSourcesResult,
    __MetadataBearer {}
declare const DeregisterTransitGatewayMulticastGroupSourcesCommand_base: {
  new (
    input: DeregisterTransitGatewayMulticastGroupSourcesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterTransitGatewayMulticastGroupSourcesCommandInput,
    DeregisterTransitGatewayMulticastGroupSourcesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeregisterTransitGatewayMulticastGroupSourcesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterTransitGatewayMulticastGroupSourcesCommandInput,
    DeregisterTransitGatewayMulticastGroupSourcesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeregisterTransitGatewayMulticastGroupSourcesCommand extends DeregisterTransitGatewayMulticastGroupSourcesCommand_base {
  protected static __types: {
    api: {
      input: DeregisterTransitGatewayMulticastGroupSourcesRequest;
      output: DeregisterTransitGatewayMulticastGroupSourcesResult;
    };
    sdk: {
      input: DeregisterTransitGatewayMulticastGroupSourcesCommandInput;
      output: DeregisterTransitGatewayMulticastGroupSourcesCommandOutput;
    };
  };
}
