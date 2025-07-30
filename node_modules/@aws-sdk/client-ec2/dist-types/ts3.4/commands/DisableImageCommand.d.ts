import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DisableImageRequest, DisableImageResult } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableImageCommandInput extends DisableImageRequest {}
export interface DisableImageCommandOutput
  extends DisableImageResult,
    __MetadataBearer {}
declare const DisableImageCommand_base: {
  new (
    input: DisableImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageCommandInput,
    DisableImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableImageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageCommandInput,
    DisableImageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableImageCommand extends DisableImageCommand_base {
  protected static __types: {
    api: {
      input: DisableImageRequest;
      output: DisableImageResult;
    };
    sdk: {
      input: DisableImageCommandInput;
      output: DisableImageCommandOutput;
    };
  };
}
