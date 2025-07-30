import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeprovisionByoipCidrRequest,
  DeprovisionByoipCidrResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeprovisionByoipCidrCommandInput
  extends DeprovisionByoipCidrRequest {}
export interface DeprovisionByoipCidrCommandOutput
  extends DeprovisionByoipCidrResult,
    __MetadataBearer {}
declare const DeprovisionByoipCidrCommand_base: {
  new (
    input: DeprovisionByoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionByoipCidrCommandInput,
    DeprovisionByoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeprovisionByoipCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionByoipCidrCommandInput,
    DeprovisionByoipCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeprovisionByoipCidrCommand extends DeprovisionByoipCidrCommand_base {
  protected static __types: {
    api: {
      input: DeprovisionByoipCidrRequest;
      output: DeprovisionByoipCidrResult;
    };
    sdk: {
      input: DeprovisionByoipCidrCommandInput;
      output: DeprovisionByoipCidrCommandOutput;
    };
  };
}
