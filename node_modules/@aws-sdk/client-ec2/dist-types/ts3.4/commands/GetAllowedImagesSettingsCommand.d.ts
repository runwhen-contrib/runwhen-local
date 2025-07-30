import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetAllowedImagesSettingsRequest,
  GetAllowedImagesSettingsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetAllowedImagesSettingsCommandInput
  extends GetAllowedImagesSettingsRequest {}
export interface GetAllowedImagesSettingsCommandOutput
  extends GetAllowedImagesSettingsResult,
    __MetadataBearer {}
declare const GetAllowedImagesSettingsCommand_base: {
  new (
    input: GetAllowedImagesSettingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetAllowedImagesSettingsCommandInput,
    GetAllowedImagesSettingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetAllowedImagesSettingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetAllowedImagesSettingsCommandInput,
    GetAllowedImagesSettingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetAllowedImagesSettingsCommand extends GetAllowedImagesSettingsCommand_base {
  protected static __types: {
    api: {
      input: GetAllowedImagesSettingsRequest;
      output: GetAllowedImagesSettingsResult;
    };
    sdk: {
      input: GetAllowedImagesSettingsCommandInput;
      output: GetAllowedImagesSettingsCommandOutput;
    };
  };
}
