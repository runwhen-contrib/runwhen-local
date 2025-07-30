import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateStoreImageTaskRequest,
  CreateStoreImageTaskResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateStoreImageTaskCommandInput
  extends CreateStoreImageTaskRequest {}
export interface CreateStoreImageTaskCommandOutput
  extends CreateStoreImageTaskResult,
    __MetadataBearer {}
declare const CreateStoreImageTaskCommand_base: {
  new (
    input: CreateStoreImageTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateStoreImageTaskCommandInput,
    CreateStoreImageTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateStoreImageTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateStoreImageTaskCommandInput,
    CreateStoreImageTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateStoreImageTaskCommand extends CreateStoreImageTaskCommand_base {
  protected static __types: {
    api: {
      input: CreateStoreImageTaskRequest;
      output: CreateStoreImageTaskResult;
    };
    sdk: {
      input: CreateStoreImageTaskCommandInput;
      output: CreateStoreImageTaskCommandOutput;
    };
  };
}
