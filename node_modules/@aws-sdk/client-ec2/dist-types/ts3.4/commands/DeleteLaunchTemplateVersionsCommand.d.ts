import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteLaunchTemplateVersionsRequest,
  DeleteLaunchTemplateVersionsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteLaunchTemplateVersionsCommandInput
  extends DeleteLaunchTemplateVersionsRequest {}
export interface DeleteLaunchTemplateVersionsCommandOutput
  extends DeleteLaunchTemplateVersionsResult,
    __MetadataBearer {}
declare const DeleteLaunchTemplateVersionsCommand_base: {
  new (
    input: DeleteLaunchTemplateVersionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLaunchTemplateVersionsCommandInput,
    DeleteLaunchTemplateVersionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteLaunchTemplateVersionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLaunchTemplateVersionsCommandInput,
    DeleteLaunchTemplateVersionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteLaunchTemplateVersionsCommand extends DeleteLaunchTemplateVersionsCommand_base {
  protected static __types: {
    api: {
      input: DeleteLaunchTemplateVersionsRequest;
      output: DeleteLaunchTemplateVersionsResult;
    };
    sdk: {
      input: DeleteLaunchTemplateVersionsCommandInput;
      output: DeleteLaunchTemplateVersionsCommandOutput;
    };
  };
}
