import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayPolicyTableRequest,
  CreateTransitGatewayPolicyTableResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayPolicyTableCommandInput
  extends CreateTransitGatewayPolicyTableRequest {}
export interface CreateTransitGatewayPolicyTableCommandOutput
  extends CreateTransitGatewayPolicyTableResult,
    __MetadataBearer {}
declare const CreateTransitGatewayPolicyTableCommand_base: {
  new (
    input: CreateTransitGatewayPolicyTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayPolicyTableCommandInput,
    CreateTransitGatewayPolicyTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayPolicyTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayPolicyTableCommandInput,
    CreateTransitGatewayPolicyTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayPolicyTableCommand extends CreateTransitGatewayPolicyTableCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayPolicyTableRequest;
      output: CreateTransitGatewayPolicyTableResult;
    };
    sdk: {
      input: CreateTransitGatewayPolicyTableCommandInput;
      output: CreateTransitGatewayPolicyTableCommandOutput;
    };
  };
}
