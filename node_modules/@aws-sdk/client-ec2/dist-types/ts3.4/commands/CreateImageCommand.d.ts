import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateImageRequest, CreateImageResult } from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateImageCommandInput extends CreateImageRequest {}
export interface CreateImageCommandOutput
  extends CreateImageResult,
    __MetadataBearer {}
declare const CreateImageCommand_base: {
  new (
    input: CreateImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateImageCommandInput,
    CreateImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateImageCommandInput,
    CreateImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateImageCommand extends CreateImageCommand_base {
  protected static __types: {
    api: {
      input: CreateImageRequest;
      output: CreateImageResult;
    };
    sdk: {
      input: CreateImageCommandInput;
      output: CreateImageCommandOutput;
    };
  };
}
