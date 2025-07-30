import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableImageDeprecationRequest,
  DisableImageDeprecationResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableImageDeprecationCommandInput
  extends DisableImageDeprecationRequest {}
export interface DisableImageDeprecationCommandOutput
  extends DisableImageDeprecationResult,
    __MetadataBearer {}
declare const DisableImageDeprecationCommand_base: {
  new (
    input: DisableImageDeprecationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageDeprecationCommandInput,
    DisableImageDeprecationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableImageDeprecationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageDeprecationCommandInput,
    DisableImageDeprecationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableImageDeprecationCommand extends DisableImageDeprecationCommand_base {
  protected static __types: {
    api: {
      input: DisableImageDeprecationRequest;
      output: DisableImageDeprecationResult;
    };
    sdk: {
      input: DisableImageDeprecationCommandInput;
      output: DisableImageDeprecationCommandOutput;
    };
  };
}
