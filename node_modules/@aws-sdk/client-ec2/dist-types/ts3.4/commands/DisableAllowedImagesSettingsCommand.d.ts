import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableAllowedImagesSettingsRequest,
  DisableAllowedImagesSettingsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableAllowedImagesSettingsCommandInput
  extends DisableAllowedImagesSettingsRequest {}
export interface DisableAllowedImagesSettingsCommandOutput
  extends DisableAllowedImagesSettingsResult,
    __MetadataBearer {}
declare const DisableAllowedImagesSettingsCommand_base: {
  new (
    input: DisableAllowedImagesSettingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableAllowedImagesSettingsCommandInput,
    DisableAllowedImagesSettingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisableAllowedImagesSettingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableAllowedImagesSettingsCommandInput,
    DisableAllowedImagesSettingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableAllowedImagesSettingsCommand extends DisableAllowedImagesSettingsCommand_base {
  protected static __types: {
    api: {
      input: DisableAllowedImagesSettingsRequest;
      output: DisableAllowedImagesSettingsResult;
    };
    sdk: {
      input: DisableAllowedImagesSettingsCommandInput;
      output: DisableAllowedImagesSettingsCommandOutput;
    };
  };
}
