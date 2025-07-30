import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateRestoreImageTaskRequest,
  CreateRestoreImageTaskResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateRestoreImageTaskCommandInput
  extends CreateRestoreImageTaskRequest {}
export interface CreateRestoreImageTaskCommandOutput
  extends CreateRestoreImageTaskResult,
    __MetadataBearer {}
declare const CreateRestoreImageTaskCommand_base: {
  new (
    input: CreateRestoreImageTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateRestoreImageTaskCommandInput,
    CreateRestoreImageTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateRestoreImageTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateRestoreImageTaskCommandInput,
    CreateRestoreImageTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateRestoreImageTaskCommand extends CreateRestoreImageTaskCommand_base {
  protected static __types: {
    api: {
      input: CreateRestoreImageTaskRequest;
      output: CreateRestoreImageTaskResult;
    };
    sdk: {
      input: CreateRestoreImageTaskCommandInput;
      output: CreateRestoreImageTaskCommandOutput;
    };
  };
}
