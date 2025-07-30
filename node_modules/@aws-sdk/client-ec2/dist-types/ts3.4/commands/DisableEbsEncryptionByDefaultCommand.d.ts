import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableEbsEncryptionByDefaultRequest,
  DisableEbsEncryptionByDefaultResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableEbsEncryptionByDefaultCommandInput
  extends DisableEbsEncryptionByDefaultRequest {}
export interface DisableEbsEncryptionByDefaultCommandOutput
  extends DisableEbsEncryptionByDefaultResult,
    __MetadataBearer {}
declare const DisableEbsEncryptionByDefaultCommand_base: {
  new (
    input: DisableEbsEncryptionByDefaultCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableEbsEncryptionByDefaultCommandInput,
    DisableEbsEncryptionByDefaultCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisableEbsEncryptionByDefaultCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableEbsEncryptionByDefaultCommandInput,
    DisableEbsEncryptionByDefaultCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableEbsEncryptionByDefaultCommand extends DisableEbsEncryptionByDefaultCommand_base {
  protected static __types: {
    api: {
      input: DisableEbsEncryptionByDefaultRequest;
      output: DisableEbsEncryptionByDefaultResult;
    };
    sdk: {
      input: DisableEbsEncryptionByDefaultCommandInput;
      output: DisableEbsEncryptionByDefaultCommandOutput;
    };
  };
}
