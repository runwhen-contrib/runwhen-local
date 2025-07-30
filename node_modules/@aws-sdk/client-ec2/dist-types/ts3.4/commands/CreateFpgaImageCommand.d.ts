import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateFpgaImageRequest,
  CreateFpgaImageResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateFpgaImageCommandInput extends CreateFpgaImageRequest {}
export interface CreateFpgaImageCommandOutput
  extends CreateFpgaImageResult,
    __MetadataBearer {}
declare const CreateFpgaImageCommand_base: {
  new (
    input: CreateFpgaImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateFpgaImageCommandInput,
    CreateFpgaImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateFpgaImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateFpgaImageCommandInput,
    CreateFpgaImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateFpgaImageCommand extends CreateFpgaImageCommand_base {
  protected static __types: {
    api: {
      input: CreateFpgaImageRequest;
      output: CreateFpgaImageResult;
    };
    sdk: {
      input: CreateFpgaImageCommandInput;
      output: CreateFpgaImageCommandOutput;
    };
  };
}
