import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeExportTasksMessage,
  ExportTasksMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeExportTasksCommandInput
  extends DescribeExportTasksMessage {}
export interface DescribeExportTasksCommandOutput
  extends ExportTasksMessage,
    __MetadataBearer {}
declare const DescribeExportTasksCommand_base: {
  new (
    input: DescribeExportTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeExportTasksCommandInput,
    DescribeExportTasksCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeExportTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeExportTasksCommandInput,
    DescribeExportTasksCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeExportTasksCommand extends DescribeExportTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeExportTasksMessage;
      output: ExportTasksMessage;
    };
    sdk: {
      input: DescribeExportTasksCommandInput;
      output: DescribeExportTasksCommandOutput;
    };
  };
}
