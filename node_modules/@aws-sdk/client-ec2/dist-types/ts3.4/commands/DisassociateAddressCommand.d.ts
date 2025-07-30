import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DisassociateAddressRequest } from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface DisassociateAddressCommandInput
  extends DisassociateAddressRequest {}
export interface DisassociateAddressCommandOutput extends __MetadataBearer {}
declare const DisassociateAddressCommand_base: {
  new (
    input: DisassociateAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisassociateAddressCommandInput,
    DisassociateAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisassociateAddressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisassociateAddressCommandInput,
    DisassociateAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisassociateAddressCommand extends DisassociateAddressCommand_base {
  protected static __types: {
    api: {
      input: DisassociateAddressRequest;
      output: {};
    };
    sdk: {
      input: DisassociateAddressCommandInput;
      output: DisassociateAddressCommandOutput;
    };
  };
}
