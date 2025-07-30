import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyLaunchTemplateRequest,
  ModifyLaunchTemplateResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyLaunchTemplateCommandInput
  extends ModifyLaunchTemplateRequest {}
export interface ModifyLaunchTemplateCommandOutput
  extends ModifyLaunchTemplateResult,
    __MetadataBearer {}
declare const ModifyLaunchTemplateCommand_base: {
  new (
    input: ModifyLaunchTemplateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyLaunchTemplateCommandInput,
    ModifyLaunchTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ModifyLaunchTemplateCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyLaunchTemplateCommandInput,
    ModifyLaunchTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyLaunchTemplateCommand extends ModifyLaunchTemplateCommand_base {
  protected static __types: {
    api: {
      input: ModifyLaunchTemplateRequest;
      output: ModifyLaunchTemplateResult;
    };
    sdk: {
      input: ModifyLaunchTemplateCommandInput;
      output: ModifyLaunchTemplateCommandOutput;
    };
  };
}
