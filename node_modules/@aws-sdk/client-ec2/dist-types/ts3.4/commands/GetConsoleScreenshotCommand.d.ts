import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetConsoleScreenshotRequest,
  GetConsoleScreenshotResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetConsoleScreenshotCommandInput
  extends GetConsoleScreenshotRequest {}
export interface GetConsoleScreenshotCommandOutput
  extends GetConsoleScreenshotResult,
    __MetadataBearer {}
declare const GetConsoleScreenshotCommand_base: {
  new (
    input: GetConsoleScreenshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetConsoleScreenshotCommandInput,
    GetConsoleScreenshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetConsoleScreenshotCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetConsoleScreenshotCommandInput,
    GetConsoleScreenshotCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetConsoleScreenshotCommand extends GetConsoleScreenshotCommand_base {
  protected static __types: {
    api: {
      input: GetConsoleScreenshotRequest;
      output: GetConsoleScreenshotResult;
    };
    sdk: {
      input: GetConsoleScreenshotCommandInput;
      output: GetConsoleScreenshotCommandOutput;
    };
  };
}
