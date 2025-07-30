import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateLaunchTemplateVersionRequest,
  CreateLaunchTemplateVersionResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateLaunchTemplateVersionCommandInput
  extends CreateLaunchTemplateVersionRequest {}
export interface CreateLaunchTemplateVersionCommandOutput
  extends CreateLaunchTemplateVersionResult,
    __MetadataBearer {}
declare const CreateLaunchTemplateVersionCommand_base: {
  new (
    input: CreateLaunchTemplateVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateLaunchTemplateVersionCommandInput,
    CreateLaunchTemplateVersionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateLaunchTemplateVersionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateLaunchTemplateVersionCommandInput,
    CreateLaunchTemplateVersionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateLaunchTemplateVersionCommand extends CreateLaunchTemplateVersionCommand_base {
  protected static __types: {
    api: {
      input: CreateLaunchTemplateVersionRequest;
      output: CreateLaunchTemplateVersionResult;
    };
    sdk: {
      input: CreateLaunchTemplateVersionCommandInput;
      output: CreateLaunchTemplateVersionCommandOutput;
    };
  };
}
