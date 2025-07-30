import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  EnableSerialConsoleAccessRequest,
  EnableSerialConsoleAccessResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableSerialConsoleAccessCommandInput
  extends EnableSerialConsoleAccessRequest {}
export interface EnableSerialConsoleAccessCommandOutput
  extends EnableSerialConsoleAccessResult,
    __MetadataBearer {}
declare const EnableSerialConsoleAccessCommand_base: {
  new (
    input: EnableSerialConsoleAccessCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableSerialConsoleAccessCommandInput,
    EnableSerialConsoleAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [EnableSerialConsoleAccessCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    EnableSerialConsoleAccessCommandInput,
    EnableSerialConsoleAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableSerialConsoleAccessCommand extends EnableSerialConsoleAccessCommand_base {
  protected static __types: {
    api: {
      input: EnableSerialConsoleAccessRequest;
      output: EnableSerialConsoleAccessResult;
    };
    sdk: {
      input: EnableSerialConsoleAccessCommandInput;
      output: EnableSerialConsoleAccessCommandOutput;
    };
  };
}
