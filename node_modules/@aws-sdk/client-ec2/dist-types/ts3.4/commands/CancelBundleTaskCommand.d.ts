import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelBundleTaskRequest,
  CancelBundleTaskResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelBundleTaskCommandInput extends CancelBundleTaskRequest {}
export interface CancelBundleTaskCommandOutput
  extends CancelBundleTaskResult,
    __MetadataBearer {}
declare const CancelBundleTaskCommand_base: {
  new (
    input: CancelBundleTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelBundleTaskCommandInput,
    CancelBundleTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelBundleTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelBundleTaskCommandInput,
    CancelBundleTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelBundleTaskCommand extends CancelBundleTaskCommand_base {
  protected static __types: {
    api: {
      input: CancelBundleTaskRequest;
      output: CancelBundleTaskResult;
    };
    sdk: {
      input: CancelBundleTaskCommandInput;
      output: CancelBundleTaskCommandOutput;
    };
  };
}
