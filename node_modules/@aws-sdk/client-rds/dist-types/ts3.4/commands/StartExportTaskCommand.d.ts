import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { ExportTask } from "../models/models_0";
import { StartExportTaskMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StartExportTaskCommandInput extends StartExportTaskMessage {}
export interface StartExportTaskCommandOutput
  extends ExportTask,
    __MetadataBearer {}
declare const StartExportTaskCommand_base: {
  new (
    input: StartExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartExportTaskCommandInput,
    StartExportTaskCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StartExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartExportTaskCommandInput,
    StartExportTaskCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StartExportTaskCommand extends StartExportTaskCommand_base {
  protected static __types: {
    api: {
      input: StartExportTaskMessage;
      output: ExportTask;
    };
    sdk: {
      input: StartExportTaskCommandInput;
      output: StartExportTaskCommandOutput;
    };
  };
}
