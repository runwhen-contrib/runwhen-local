import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { CancelExportTaskMessage, ExportTask } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CancelExportTaskCommandInput extends CancelExportTaskMessage {}
export interface CancelExportTaskCommandOutput
  extends ExportTask,
    __MetadataBearer {}
declare const CancelExportTaskCommand_base: {
  new (
    input: CancelExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelExportTaskCommandInput,
    CancelExportTaskCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelExportTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelExportTaskCommandInput,
    CancelExportTaskCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelExportTaskCommand extends CancelExportTaskCommand_base {
  protected static __types: {
    api: {
      input: CancelExportTaskMessage;
      output: ExportTask;
    };
    sdk: {
      input: CancelExportTaskCommandInput;
      output: CancelExportTaskCommandOutput;
    };
  };
}
