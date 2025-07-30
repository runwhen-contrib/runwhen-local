import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CopyFpgaImageRequest, CopyFpgaImageResult } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CopyFpgaImageCommandInput extends CopyFpgaImageRequest {}
export interface CopyFpgaImageCommandOutput
  extends CopyFpgaImageResult,
    __MetadataBearer {}
declare const CopyFpgaImageCommand_base: {
  new (
    input: CopyFpgaImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyFpgaImageCommandInput,
    CopyFpgaImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CopyFpgaImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyFpgaImageCommandInput,
    CopyFpgaImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CopyFpgaImageCommand extends CopyFpgaImageCommand_base {
  protected static __types: {
    api: {
      input: CopyFpgaImageRequest;
      output: CopyFpgaImageResult;
    };
    sdk: {
      input: CopyFpgaImageCommandInput;
      output: CopyFpgaImageCommandOutput;
    };
  };
}
