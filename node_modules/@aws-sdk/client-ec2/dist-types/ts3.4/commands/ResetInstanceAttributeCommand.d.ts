import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ResetInstanceAttributeRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetInstanceAttributeCommandInput
  extends ResetInstanceAttributeRequest {}
export interface ResetInstanceAttributeCommandOutput extends __MetadataBearer {}
declare const ResetInstanceAttributeCommand_base: {
  new (
    input: ResetInstanceAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetInstanceAttributeCommandInput,
    ResetInstanceAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetInstanceAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetInstanceAttributeCommandInput,
    ResetInstanceAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetInstanceAttributeCommand extends ResetInstanceAttributeCommand_base {
  protected static __types: {
    api: {
      input: ResetInstanceAttributeRequest;
      output: {};
    };
    sdk: {
      input: ResetInstanceAttributeCommandInput;
      output: ResetInstanceAttributeCommandOutput;
    };
  };
}
