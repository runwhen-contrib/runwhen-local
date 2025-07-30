import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateTransitGatewayPolicyTableRequest,
  AssociateTransitGatewayPolicyTableResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateTransitGatewayPolicyTableCommandInput
  extends AssociateTransitGatewayPolicyTableRequest {}
export interface AssociateTransitGatewayPolicyTableCommandOutput
  extends AssociateTransitGatewayPolicyTableResult,
    __MetadataBearer {}
declare const AssociateTransitGatewayPolicyTableCommand_base: {
  new (
    input: AssociateTransitGatewayPolicyTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTransitGatewayPolicyTableCommandInput,
    AssociateTransitGatewayPolicyTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateTransitGatewayPolicyTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateTransitGatewayPolicyTableCommandInput,
    AssociateTransitGatewayPolicyTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateTransitGatewayPolicyTableCommand extends AssociateTransitGatewayPolicyTableCommand_base {
  protected static __types: {
    api: {
      input: AssociateTransitGatewayPolicyTableRequest;
      output: AssociateTransitGatewayPolicyTableResult;
    };
    sdk: {
      input: AssociateTransitGatewayPolicyTableCommandInput;
      output: AssociateTransitGatewayPolicyTableCommandOutput;
    };
  };
}
