import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetConsoleOutputRequest,
  GetConsoleOutputResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetConsoleOutputCommandInput extends GetConsoleOutputRequest {}
export interface GetConsoleOutputCommandOutput
  extends GetConsoleOutputResult,
    __MetadataBearer {}
declare const GetConsoleOutputCommand_base: {
  new (
    input: GetConsoleOutputCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetConsoleOutputCommandInput,
    GetConsoleOutputCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetConsoleOutputCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetConsoleOutputCommandInput,
    GetConsoleOutputCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetConsoleOutputCommand extends GetConsoleOutputCommand_base {
  protected static __types: {
    api: {
      input: GetConsoleOutputRequest;
      output: GetConsoleOutputResult;
    };
    sdk: {
      input: GetConsoleOutputCommandInput;
      output: GetConsoleOutputCommandOutput;
    };
  };
}
