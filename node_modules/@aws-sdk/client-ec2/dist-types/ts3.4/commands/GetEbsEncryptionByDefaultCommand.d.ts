import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetEbsEncryptionByDefaultRequest,
  GetEbsEncryptionByDefaultResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetEbsEncryptionByDefaultCommandInput
  extends GetEbsEncryptionByDefaultRequest {}
export interface GetEbsEncryptionByDefaultCommandOutput
  extends GetEbsEncryptionByDefaultResult,
    __MetadataBearer {}
declare const GetEbsEncryptionByDefaultCommand_base: {
  new (
    input: GetEbsEncryptionByDefaultCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetEbsEncryptionByDefaultCommandInput,
    GetEbsEncryptionByDefaultCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetEbsEncryptionByDefaultCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetEbsEncryptionByDefaultCommandInput,
    GetEbsEncryptionByDefaultCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetEbsEncryptionByDefaultCommand extends GetEbsEncryptionByDefaultCommand_base {
  protected static __types: {
    api: {
      input: GetEbsEncryptionByDefaultRequest;
      output: GetEbsEncryptionByDefaultResult;
    };
    sdk: {
      input: GetEbsEncryptionByDefaultCommandInput;
      output: GetEbsEncryptionByDefaultCommandOutput;
    };
  };
}
