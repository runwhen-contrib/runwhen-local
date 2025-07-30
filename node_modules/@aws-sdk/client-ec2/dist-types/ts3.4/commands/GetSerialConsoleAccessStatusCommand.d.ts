import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetSerialConsoleAccessStatusRequest,
  GetSerialConsoleAccessStatusResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetSerialConsoleAccessStatusCommandInput
  extends GetSerialConsoleAccessStatusRequest {}
export interface GetSerialConsoleAccessStatusCommandOutput
  extends GetSerialConsoleAccessStatusResult,
    __MetadataBearer {}
declare const GetSerialConsoleAccessStatusCommand_base: {
  new (
    input: GetSerialConsoleAccessStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSerialConsoleAccessStatusCommandInput,
    GetSerialConsoleAccessStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetSerialConsoleAccessStatusCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetSerialConsoleAccessStatusCommandInput,
    GetSerialConsoleAccessStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetSerialConsoleAccessStatusCommand extends GetSerialConsoleAccessStatusCommand_base {
  protected static __types: {
    api: {
      input: GetSerialConsoleAccessStatusRequest;
      output: GetSerialConsoleAccessStatusResult;
    };
    sdk: {
      input: GetSerialConsoleAccessStatusCommandInput;
      output: GetSerialConsoleAccessStatusCommandOutput;
    };
  };
}
