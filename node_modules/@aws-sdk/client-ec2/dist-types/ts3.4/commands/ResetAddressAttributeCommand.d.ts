import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ResetAddressAttributeRequest,
  ResetAddressAttributeResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetAddressAttributeCommandInput
  extends ResetAddressAttributeRequest {}
export interface ResetAddressAttributeCommandOutput
  extends ResetAddressAttributeResult,
    __MetadataBearer {}
declare const ResetAddressAttributeCommand_base: {
  new (
    input: ResetAddressAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetAddressAttributeCommandInput,
    ResetAddressAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetAddressAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetAddressAttributeCommandInput,
    ResetAddressAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetAddressAttributeCommand extends ResetAddressAttributeCommand_base {
  protected static __types: {
    api: {
      input: ResetAddressAttributeRequest;
      output: ResetAddressAttributeResult;
    };
    sdk: {
      input: ResetAddressAttributeCommandInput;
      output: ResetAddressAttributeCommandOutput;
    };
  };
}
