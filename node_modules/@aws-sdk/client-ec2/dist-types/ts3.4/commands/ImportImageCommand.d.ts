import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ImportImageRequest, ImportImageResult } from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface ImportImageCommandInput extends ImportImageRequest {}
export interface ImportImageCommandOutput
  extends ImportImageResult,
    __MetadataBearer {}
declare const ImportImageCommand_base: {
  new (
    input: ImportImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ImportImageCommandInput,
    ImportImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ImportImageCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ImportImageCommandInput,
    ImportImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ImportImageCommand extends ImportImageCommand_base {
  protected static __types: {
    api: {
      input: ImportImageRequest;
      output: ImportImageResult;
    };
    sdk: {
      input: ImportImageCommandInput;
      output: ImportImageCommandOutput;
    };
  };
}
