import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssignPrivateNatGatewayAddressRequest,
  AssignPrivateNatGatewayAddressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssignPrivateNatGatewayAddressCommandInput
  extends AssignPrivateNatGatewayAddressRequest {}
export interface AssignPrivateNatGatewayAddressCommandOutput
  extends AssignPrivateNatGatewayAddressResult,
    __MetadataBearer {}
declare const AssignPrivateNatGatewayAddressCommand_base: {
  new (
    input: AssignPrivateNatGatewayAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssignPrivateNatGatewayAddressCommandInput,
    AssignPrivateNatGatewayAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssignPrivateNatGatewayAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssignPrivateNatGatewayAddressCommandInput,
    AssignPrivateNatGatewayAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssignPrivateNatGatewayAddressCommand extends AssignPrivateNatGatewayAddressCommand_base {
  protected static __types: {
    api: {
      input: AssignPrivateNatGatewayAddressRequest;
      output: AssignPrivateNatGatewayAddressResult;
    };
    sdk: {
      input: AssignPrivateNatGatewayAddressCommandInput;
      output: AssignPrivateNatGatewayAddressCommandOutput;
    };
  };
}
