import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReplaceImageCriteriaInAllowedImagesSettingsRequest,
  ReplaceImageCriteriaInAllowedImagesSettingsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceImageCriteriaInAllowedImagesSettingsCommandInput
  extends ReplaceImageCriteriaInAllowedImagesSettingsRequest {}
export interface ReplaceImageCriteriaInAllowedImagesSettingsCommandOutput
  extends ReplaceImageCriteriaInAllowedImagesSettingsResult,
    __MetadataBearer {}
declare const ReplaceImageCriteriaInAllowedImagesSettingsCommand_base: {
  new (
    input: ReplaceImageCriteriaInAllowedImagesSettingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceImageCriteriaInAllowedImagesSettingsCommandInput,
    ReplaceImageCriteriaInAllowedImagesSettingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ReplaceImageCriteriaInAllowedImagesSettingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceImageCriteriaInAllowedImagesSettingsCommandInput,
    ReplaceImageCriteriaInAllowedImagesSettingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceImageCriteriaInAllowedImagesSettingsCommand extends ReplaceImageCriteriaInAllowedImagesSettingsCommand_base {
  protected static __types: {
    api: {
      input: ReplaceImageCriteriaInAllowedImagesSettingsRequest;
      output: ReplaceImageCriteriaInAllowedImagesSettingsResult;
    };
    sdk: {
      input: ReplaceImageCriteriaInAllowedImagesSettingsCommandInput;
      output: ReplaceImageCriteriaInAllowedImagesSettingsCommandOutput;
    };
  };
}
