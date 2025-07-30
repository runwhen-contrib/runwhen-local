import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateReplaceRootVolumeTaskRequest,
  CreateReplaceRootVolumeTaskResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateReplaceRootVolumeTaskCommandInput
  extends CreateReplaceRootVolumeTaskRequest {}
export interface CreateReplaceRootVolumeTaskCommandOutput
  extends CreateReplaceRootVolumeTaskResult,
    __MetadataBearer {}
declare const CreateReplaceRootVolumeTaskCommand_base: {
  new (
    input: CreateReplaceRootVolumeTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateReplaceRootVolumeTaskCommandInput,
    CreateReplaceRootVolumeTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateReplaceRootVolumeTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateReplaceRootVolumeTaskCommandInput,
    CreateReplaceRootVolumeTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateReplaceRootVolumeTaskCommand extends CreateReplaceRootVolumeTaskCommand_base {
  protected static __types: {
    api: {
      input: CreateReplaceRootVolumeTaskRequest;
      output: CreateReplaceRootVolumeTaskResult;
    };
    sdk: {
      input: CreateReplaceRootVolumeTaskCommandInput;
      output: CreateReplaceRootVolumeTaskCommandOutput;
    };
  };
}
