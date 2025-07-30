import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DownloadDBLogFilePortionDetails,
  DownloadDBLogFilePortionMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DownloadDBLogFilePortionCommandInput
  extends DownloadDBLogFilePortionMessage {}
export interface DownloadDBLogFilePortionCommandOutput
  extends DownloadDBLogFilePortionDetails,
    __MetadataBearer {}
declare const DownloadDBLogFilePortionCommand_base: {
  new (
    input: DownloadDBLogFilePortionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DownloadDBLogFilePortionCommandInput,
    DownloadDBLogFilePortionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DownloadDBLogFilePortionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DownloadDBLogFilePortionCommandInput,
    DownloadDBLogFilePortionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DownloadDBLogFilePortionCommand extends DownloadDBLogFilePortionCommand_base {
  protected static __types: {
    api: {
      input: DownloadDBLogFilePortionMessage;
      output: DownloadDBLogFilePortionDetails;
    };
    sdk: {
      input: DownloadDBLogFilePortionCommandInput;
      output: DownloadDBLogFilePortionCommandOutput;
    };
  };
}
