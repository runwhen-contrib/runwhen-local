import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteLaunchTemplateRequest,
  DeleteLaunchTemplateResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteLaunchTemplateCommandInput
  extends DeleteLaunchTemplateRequest {}
export interface DeleteLaunchTemplateCommandOutput
  extends DeleteLaunchTemplateResult,
    __MetadataBearer {}
declare const DeleteLaunchTemplateCommand_base: {
  new (
    input: DeleteLaunchTemplateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLaunchTemplateCommandInput,
    DeleteLaunchTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeleteLaunchTemplateCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLaunchTemplateCommandInput,
    DeleteLaunchTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteLaunchTemplateCommand extends DeleteLaunchTemplateCommand_base {
  protected static __types: {
    api: {
      input: DeleteLaunchTemplateRequest;
      output: DeleteLaunchTemplateResult;
    };
    sdk: {
      input: DeleteLaunchTemplateCommandInput;
      output: DeleteLaunchTemplateCommandOutput;
    };
  };
}
