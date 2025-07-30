import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ResetEbsDefaultKmsKeyIdRequest,
  ResetEbsDefaultKmsKeyIdResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetEbsDefaultKmsKeyIdCommandInput
  extends ResetEbsDefaultKmsKeyIdRequest {}
export interface ResetEbsDefaultKmsKeyIdCommandOutput
  extends ResetEbsDefaultKmsKeyIdResult,
    __MetadataBearer {}
declare const ResetEbsDefaultKmsKeyIdCommand_base: {
  new (
    input: ResetEbsDefaultKmsKeyIdCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetEbsDefaultKmsKeyIdCommandInput,
    ResetEbsDefaultKmsKeyIdCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ResetEbsDefaultKmsKeyIdCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ResetEbsDefaultKmsKeyIdCommandInput,
    ResetEbsDefaultKmsKeyIdCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetEbsDefaultKmsKeyIdCommand extends ResetEbsDefaultKmsKeyIdCommand_base {
  protected static __types: {
    api: {
      input: ResetEbsDefaultKmsKeyIdRequest;
      output: ResetEbsDefaultKmsKeyIdResult;
    };
    sdk: {
      input: ResetEbsDefaultKmsKeyIdCommandInput;
      output: ResetEbsDefaultKmsKeyIdCommandOutput;
    };
  };
}
