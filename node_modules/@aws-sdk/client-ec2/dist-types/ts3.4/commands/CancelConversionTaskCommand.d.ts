import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CancelConversionRequest } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelConversionTaskCommandInput
  extends CancelConversionRequest {}
export interface CancelConversionTaskCommandOutput extends __MetadataBearer {}
declare const CancelConversionTaskCommand_base: {
  new (
    input: CancelConversionTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelConversionTaskCommandInput,
    CancelConversionTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelConversionTaskCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelConversionTaskCommandInput,
    CancelConversionTaskCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelConversionTaskCommand extends CancelConversionTaskCommand_base {
  protected static __types: {
    api: {
      input: CancelConversionRequest;
      output: {};
    };
    sdk: {
      input: CancelConversionTaskCommandInput;
      output: CancelConversionTaskCommandOutput;
    };
  };
}
