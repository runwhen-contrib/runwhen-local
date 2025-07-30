import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetEbsDefaultKmsKeyIdRequest,
  GetEbsDefaultKmsKeyIdResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetEbsDefaultKmsKeyIdCommandInput
  extends GetEbsDefaultKmsKeyIdRequest {}
export interface GetEbsDefaultKmsKeyIdCommandOutput
  extends GetEbsDefaultKmsKeyIdResult,
    __MetadataBearer {}
declare const GetEbsDefaultKmsKeyIdCommand_base: {
  new (
    input: GetEbsDefaultKmsKeyIdCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetEbsDefaultKmsKeyIdCommandInput,
    GetEbsDefaultKmsKeyIdCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetEbsDefaultKmsKeyIdCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetEbsDefaultKmsKeyIdCommandInput,
    GetEbsDefaultKmsKeyIdCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetEbsDefaultKmsKeyIdCommand extends GetEbsDefaultKmsKeyIdCommand_base {
  protected static __types: {
    api: {
      input: GetEbsDefaultKmsKeyIdRequest;
      output: GetEbsDefaultKmsKeyIdResult;
    };
    sdk: {
      input: GetEbsDefaultKmsKeyIdCommandInput;
      output: GetEbsDefaultKmsKeyIdCommandOutput;
    };
  };
}
