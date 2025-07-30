import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableSerialConsoleAccessRequest,
  DisableSerialConsoleAccessResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface DisableSerialConsoleAccessCommandInput
  extends DisableSerialConsoleAccessRequest {}
export interface DisableSerialConsoleAccessCommandOutput
  extends DisableSerialConsoleAccessResult,
    __MetadataBearer {}
declare const DisableSerialConsoleAccessCommand_base: {
  new (
    input: DisableSerialConsoleAccessCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableSerialConsoleAccessCommandInput,
    DisableSerialConsoleAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisableSerialConsoleAccessCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableSerialConsoleAccessCommandInput,
    DisableSerialConsoleAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableSerialConsoleAccessCommand extends DisableSerialConsoleAccessCommand_base {
  protected static __types: {
    api: {
      input: DisableSerialConsoleAccessRequest;
      output: DisableSerialConsoleAccessResult;
    };
    sdk: {
      input: DisableSerialConsoleAccessCommandInput;
      output: DisableSerialConsoleAccessCommandOutput;
    };
  };
}
