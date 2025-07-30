import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelImportTaskRequest,
  CancelImportTaskResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelImportTaskCommandInput extends CancelImportTaskRequest {}
export interface CancelImportTaskCommandOutput
  extends CancelImportTaskResult,
    __MetadataBearer {}
declare const CancelImportTaskCommand_base: {
  new (
    input: CancelImportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelImportTaskCommandInput,
    CancelImportTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CancelImportTaskCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CancelImportTaskCommandInput,
    CancelImportTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelImportTaskCommand extends CancelImportTaskCommand_base {
  protected static __types: {
    api: {
      input: CancelImportTaskRequest;
      output: CancelImportTaskResult;
    };
    sdk: {
      input: CancelImportTaskCommandInput;
      output: CancelImportTaskCommandOutput;
    };
  };
}
