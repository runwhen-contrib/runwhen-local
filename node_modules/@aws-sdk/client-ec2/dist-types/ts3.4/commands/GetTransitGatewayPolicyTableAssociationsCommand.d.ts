import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayPolicyTableAssociationsRequest,
  GetTransitGatewayPolicyTableAssociationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayPolicyTableAssociationsCommandInput
  extends GetTransitGatewayPolicyTableAssociationsRequest {}
export interface GetTransitGatewayPolicyTableAssociationsCommandOutput
  extends GetTransitGatewayPolicyTableAssociationsResult,
    __MetadataBearer {}
declare const GetTransitGatewayPolicyTableAssociationsCommand_base: {
  new (
    input: GetTransitGatewayPolicyTableAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayPolicyTableAssociationsCommandInput,
    GetTransitGatewayPolicyTableAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayPolicyTableAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayPolicyTableAssociationsCommandInput,
    GetTransitGatewayPolicyTableAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayPolicyTableAssociationsCommand extends GetTransitGatewayPolicyTableAssociationsCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayPolicyTableAssociationsRequest;
      output: GetTransitGatewayPolicyTableAssociationsResult;
    };
    sdk: {
      input: GetTransitGatewayPolicyTableAssociationsCommandInput;
      output: GetTransitGatewayPolicyTableAssociationsCommandOutput;
    };
  };
}
