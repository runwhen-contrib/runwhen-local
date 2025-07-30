import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  EnableEbsEncryptionByDefaultRequest,
  EnableEbsEncryptionByDefaultResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableEbsEncryptionByDefaultCommandInput
  extends EnableEbsEncryptionByDefaultRequest {}
export interface EnableEbsEncryptionByDefaultCommandOutput
  extends EnableEbsEncryptionByDefaultResult,
    __MetadataBearer {}
declare const EnableEbsEncryptionByDefaultCommand_base: {
  new (
    input: EnableEbsEncryptionByDefaultCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableEbsEncryptionByDefaultCommandInput,
    EnableEbsEncryptionByDefaultCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [EnableEbsEncryptionByDefaultCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    EnableEbsEncryptionByDefaultCommandInput,
    EnableEbsEncryptionByDefaultCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableEbsEncryptionByDefaultCommand extends EnableEbsEncryptionByDefaultCommand_base {
  protected static __types: {
    api: {
      input: EnableEbsEncryptionByDefaultRequest;
      output: EnableEbsEncryptionByDefaultResult;
    };
    sdk: {
      input: EnableEbsEncryptionByDefaultCommandInput;
      output: EnableEbsEncryptionByDefaultCommandOutput;
    };
  };
}
