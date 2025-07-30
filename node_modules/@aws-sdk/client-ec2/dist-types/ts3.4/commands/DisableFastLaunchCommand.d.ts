import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableFastLaunchRequest,
  DisableFastLaunchResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableFastLaunchCommandInput
  extends DisableFastLaunchRequest {}
export interface DisableFastLaunchCommandOutput
  extends DisableFastLaunchResult,
    __MetadataBearer {}
declare const DisableFastLaunchCommand_base: {
  new (
    input: DisableFastLaunchCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableFastLaunchCommandInput,
    DisableFastLaunchCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableFastLaunchCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableFastLaunchCommandInput,
    DisableFastLaunchCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableFastLaunchCommand extends DisableFastLaunchCommand_base {
  protected static __types: {
    api: {
      input: DisableFastLaunchRequest;
      output: DisableFastLaunchResult;
    };
    sdk: {
      input: DisableFastLaunchCommandInput;
      output: DisableFastLaunchCommandOutput;
    };
  };
}
