import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CancelExportTaskRequest } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelExportTaskCommandInput extends CancelExportTaskRequest {}
export interface CancelExportTaskCommandOutput extends __MetadataBearer {}
declare const CancelExportTaskCommand_base: {
  new (
    input: CancelExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelExportTaskCommandInput,
    CancelExportTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelExportTaskCommandInput,
    CancelExportTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelExportTaskCommand extends CancelExportTaskCommand_base {
  protected static __types: {
    api: {
      input: CancelExportTaskRequest;
      output: {};
    };
    sdk: {
      input: CancelExportTaskCommandInput;
      output: CancelExportTaskCommandOutput;
    };
  };
}
