import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateLaunchTemplateRequest,
  CreateLaunchTemplateResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateLaunchTemplateCommandInput
  extends CreateLaunchTemplateRequest {}
export interface CreateLaunchTemplateCommandOutput
  extends CreateLaunchTemplateResult,
    __MetadataBearer {}
declare const CreateLaunchTemplateCommand_base: {
  new (
    input: CreateLaunchTemplateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateLaunchTemplateCommandInput,
    CreateLaunchTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateLaunchTemplateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateLaunchTemplateCommandInput,
    CreateLaunchTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateLaunchTemplateCommand extends CreateLaunchTemplateCommand_base {
  protected static __types: {
    api: {
      input: CreateLaunchTemplateRequest;
      output: CreateLaunchTemplateResult;
    };
    sdk: {
      input: CreateLaunchTemplateCommandInput;
      output: CreateLaunchTemplateCommandOutput;
    };
  };
}
