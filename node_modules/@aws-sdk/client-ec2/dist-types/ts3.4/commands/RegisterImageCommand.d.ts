import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { RegisterImageRequest, RegisterImageResult } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RegisterImageCommandInput extends RegisterImageRequest {}
export interface RegisterImageCommandOutput
  extends RegisterImageResult,
    __MetadataBearer {}
declare const RegisterImageCommand_base: {
  new (
    input: RegisterImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterImageCommandInput,
    RegisterImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RegisterImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterImageCommandInput,
    RegisterImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RegisterImageCommand extends RegisterImageCommand_base {
  protected static __types: {
    api: {
      input: RegisterImageRequest;
      output: RegisterImageResult;
    };
    sdk: {
      input: RegisterImageCommandInput;
      output: RegisterImageCommandOutput;
    };
  };
}
