import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ListImagesInRecycleBinRequest,
  ListImagesInRecycleBinResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ListImagesInRecycleBinCommandInput
  extends ListImagesInRecycleBinRequest {}
export interface ListImagesInRecycleBinCommandOutput
  extends ListImagesInRecycleBinResult,
    __MetadataBearer {}
declare const ListImagesInRecycleBinCommand_base: {
  new (
    input: ListImagesInRecycleBinCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ListImagesInRecycleBinCommandInput,
    ListImagesInRecycleBinCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ListImagesInRecycleBinCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ListImagesInRecycleBinCommandInput,
    ListImagesInRecycleBinCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ListImagesInRecycleBinCommand extends ListImagesInRecycleBinCommand_base {
  protected static __types: {
    api: {
      input: ListImagesInRecycleBinRequest;
      output: ListImagesInRecycleBinResult;
    };
    sdk: {
      input: ListImagesInRecycleBinCommandInput;
      output: ListImagesInRecycleBinCommandOutput;
    };
  };
}
