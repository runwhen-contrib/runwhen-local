import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetDefaultCreditSpecificationRequest,
  GetDefaultCreditSpecificationResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetDefaultCreditSpecificationCommandInput
  extends GetDefaultCreditSpecificationRequest {}
export interface GetDefaultCreditSpecificationCommandOutput
  extends GetDefaultCreditSpecificationResult,
    __MetadataBearer {}
declare const GetDefaultCreditSpecificationCommand_base: {
  new (
    input: GetDefaultCreditSpecificationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetDefaultCreditSpecificationCommandInput,
    GetDefaultCreditSpecificationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetDefaultCreditSpecificationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetDefaultCreditSpecificationCommandInput,
    GetDefaultCreditSpecificationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetDefaultCreditSpecificationCommand extends GetDefaultCreditSpecificationCommand_base {
  protected static __types: {
    api: {
      input: GetDefaultCreditSpecificationRequest;
      output: GetDefaultCreditSpecificationResult;
    };
    sdk: {
      input: GetDefaultCreditSpecificationCommandInput;
      output: GetDefaultCreditSpecificationCommandOutput;
    };
  };
}
