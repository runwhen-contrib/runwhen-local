import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ProvisionByoipCidrRequest,
  ProvisionByoipCidrResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ProvisionByoipCidrCommandInput
  extends ProvisionByoipCidrRequest {}
export interface ProvisionByoipCidrCommandOutput
  extends ProvisionByoipCidrResult,
    __MetadataBearer {}
declare const ProvisionByoipCidrCommand_base: {
  new (
    input: ProvisionByoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionByoipCidrCommandInput,
    ProvisionByoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ProvisionByoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionByoipCidrCommandInput,
    ProvisionByoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ProvisionByoipCidrCommand extends ProvisionByoipCidrCommand_base {
  protected static __types: {
    api: {
      input: ProvisionByoipCidrRequest;
      output: ProvisionByoipCidrResult;
    };
    sdk: {
      input: ProvisionByoipCidrCommandInput;
      output: ProvisionByoipCidrCommandOutput;
    };
  };
}
