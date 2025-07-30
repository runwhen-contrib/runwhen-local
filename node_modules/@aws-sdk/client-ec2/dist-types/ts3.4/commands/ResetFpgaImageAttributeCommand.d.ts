import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ResetFpgaImageAttributeRequest,
  ResetFpgaImageAttributeResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetFpgaImageAttributeCommandInput
  extends ResetFpgaImageAttributeRequest {}
export interface ResetFpgaImageAttributeCommandOutput
  extends ResetFpgaImageAttributeResult,
    __MetadataBearer {}
declare const ResetFpgaImageAttributeCommand_base: {
  new (
    input: ResetFpgaImageAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetFpgaImageAttributeCommandInput,
    ResetFpgaImageAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetFpgaImageAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetFpgaImageAttributeCommandInput,
    ResetFpgaImageAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetFpgaImageAttributeCommand extends ResetFpgaImageAttributeCommand_base {
  protected static __types: {
    api: {
      input: ResetFpgaImageAttributeRequest;
      output: ResetFpgaImageAttributeResult;
    };
    sdk: {
      input: ResetFpgaImageAttributeCommandInput;
      output: ResetFpgaImageAttributeCommandOutput;
    };
  };
}
