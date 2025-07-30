import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateInstanceExportTaskRequest,
  CreateInstanceExportTaskResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateInstanceExportTaskCommandInput
  extends CreateInstanceExportTaskRequest {}
export interface CreateInstanceExportTaskCommandOutput
  extends CreateInstanceExportTaskResult,
    __MetadataBearer {}
declare const CreateInstanceExportTaskCommand_base: {
  new (
    input: CreateInstanceExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInstanceExportTaskCommandInput,
    CreateInstanceExportTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateInstanceExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInstanceExportTaskCommandInput,
    CreateInstanceExportTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateInstanceExportTaskCommand extends CreateInstanceExportTaskCommand_base {
  protected static __types: {
    api: {
      input: CreateInstanceExportTaskRequest;
      output: CreateInstanceExportTaskResult;
    };
    sdk: {
      input: CreateInstanceExportTaskCommandInput;
      output: CreateInstanceExportTaskCommandOutput;
    };
  };
}
