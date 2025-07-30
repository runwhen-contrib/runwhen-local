import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetCoipPoolUsageRequest,
  GetCoipPoolUsageResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetCoipPoolUsageCommandInput extends GetCoipPoolUsageRequest {}
export interface GetCoipPoolUsageCommandOutput
  extends GetCoipPoolUsageResult,
    __MetadataBearer {}
declare const GetCoipPoolUsageCommand_base: {
  new (
    input: GetCoipPoolUsageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetCoipPoolUsageCommandInput,
    GetCoipPoolUsageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetCoipPoolUsageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetCoipPoolUsageCommandInput,
    GetCoipPoolUsageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetCoipPoolUsageCommand extends GetCoipPoolUsageCommand_base {
  protected static __types: {
    api: {
      input: GetCoipPoolUsageRequest;
      output: GetCoipPoolUsageResult;
    };
    sdk: {
      input: GetCoipPoolUsageCommandInput;
      output: GetCoipPoolUsageCommandOutput;
    };
  };
}
