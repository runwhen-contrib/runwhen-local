import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableImageDeregistrationProtectionRequest,
  DisableImageDeregistrationProtectionResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableImageDeregistrationProtectionCommandInput
  extends DisableImageDeregistrationProtectionRequest {}
export interface DisableImageDeregistrationProtectionCommandOutput
  extends DisableImageDeregistrationProtectionResult,
    __MetadataBearer {}
declare const DisableImageDeregistrationProtectionCommand_base: {
  new (
    input: DisableImageDeregistrationProtectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageDeregistrationProtectionCommandInput,
    DisableImageDeregistrationProtectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableImageDeregistrationProtectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageDeregistrationProtectionCommandInput,
    DisableImageDeregistrationProtectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableImageDeregistrationProtectionCommand extends DisableImageDeregistrationProtectionCommand_base {
  protected static __types: {
    api: {
      input: DisableImageDeregistrationProtectionRequest;
      output: DisableImageDeregistrationProtectionResult;
    };
    sdk: {
      input: DisableImageDeregistrationProtectionCommandInput;
      output: DisableImageDeregistrationProtectionCommandOutput;
    };
  };
}
