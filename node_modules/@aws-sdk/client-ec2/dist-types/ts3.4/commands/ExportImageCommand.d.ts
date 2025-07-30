import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ExportImageRequest, ExportImageResult } from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface ExportImageCommandInput extends ExportImageRequest {}
export interface ExportImageCommandOutput
  extends ExportImageResult,
    __MetadataBearer {}
declare const ExportImageCommand_base: {
  new (
    input: ExportImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportImageCommandInput,
    ExportImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ExportImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportImageCommandInput,
    ExportImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ExportImageCommand extends ExportImageCommand_base {
  protected static __types: {
    api: {
      input: ExportImageRequest;
      output: ExportImageResult;
    };
    sdk: {
      input: ExportImageCommandInput;
      output: ExportImageCommandOutput;
    };
  };
}
