import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ResetImageAttributeRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetImageAttributeCommandInput
  extends ResetImageAttributeRequest {}
export interface ResetImageAttributeCommandOutput extends __MetadataBearer {}
declare const ResetImageAttributeCommand_base: {
  new (
    input: ResetImageAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetImageAttributeCommandInput,
    ResetImageAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetImageAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetImageAttributeCommandInput,
    ResetImageAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetImageAttributeCommand extends ResetImageAttributeCommand_base {
  protected static __types: {
    api: {
      input: ResetImageAttributeRequest;
      output: {};
    };
    sdk: {
      input: ResetImageAttributeCommandInput;
      output: ResetImageAttributeCommandOutput;
    };
  };
}
