import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetLaunchTemplateDataRequest,
  GetLaunchTemplateDataResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetLaunchTemplateDataCommandInput
  extends GetLaunchTemplateDataRequest {}
export interface GetLaunchTemplateDataCommandOutput
  extends GetLaunchTemplateDataResult,
    __MetadataBearer {}
declare const GetLaunchTemplateDataCommand_base: {
  new (
    input: GetLaunchTemplateDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetLaunchTemplateDataCommandInput,
    GetLaunchTemplateDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetLaunchTemplateDataCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetLaunchTemplateDataCommandInput,
    GetLaunchTemplateDataCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetLaunchTemplateDataCommand extends GetLaunchTemplateDataCommand_base {
  protected static __types: {
    api: {
      input: GetLaunchTemplateDataRequest;
      output: GetLaunchTemplateDataResult;
    };
    sdk: {
      input: GetLaunchTemplateDataCommandInput;
      output: GetLaunchTemplateDataCommandOutput;
    };
  };
}
