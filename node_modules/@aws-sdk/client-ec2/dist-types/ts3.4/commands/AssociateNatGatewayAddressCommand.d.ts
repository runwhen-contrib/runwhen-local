import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateNatGatewayAddressRequest,
  AssociateNatGatewayAddressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateNatGatewayAddressCommandInput
  extends AssociateNatGatewayAddressRequest {}
export interface AssociateNatGatewayAddressCommandOutput
  extends AssociateNatGatewayAddressResult,
    __MetadataBearer {}
declare const AssociateNatGatewayAddressCommand_base: {
  new (
    input: AssociateNatGatewayAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateNatGatewayAddressCommandInput,
    AssociateNatGatewayAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateNatGatewayAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateNatGatewayAddressCommandInput,
    AssociateNatGatewayAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateNatGatewayAddressCommand extends AssociateNatGatewayAddressCommand_base {
  protected static __types: {
    api: {
      input: AssociateNatGatewayAddressRequest;
      output: AssociateNatGatewayAddressResult;
    };
    sdk: {
      input: AssociateNatGatewayAddressCommandInput;
      output: AssociateNatGatewayAddressCommandOutput;
    };
  };
}
