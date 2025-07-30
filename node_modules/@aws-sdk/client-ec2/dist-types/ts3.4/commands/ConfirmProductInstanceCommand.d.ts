import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ConfirmProductInstanceRequest,
  ConfirmProductInstanceResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface ConfirmProductInstanceCommandInput
  extends ConfirmProductInstanceRequest {}
export interface ConfirmProductInstanceCommandOutput
  extends ConfirmProductInstanceResult,
    __MetadataBearer {}
declare const ConfirmProductInstanceCommand_base: {
  new (
    input: ConfirmProductInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ConfirmProductInstanceCommandInput,
    ConfirmProductInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ConfirmProductInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ConfirmProductInstanceCommandInput,
    ConfirmProductInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ConfirmProductInstanceCommand extends ConfirmProductInstanceCommand_base {
  protected static __types: {
    api: {
      input: ConfirmProductInstanceRequest;
      output: ConfirmProductInstanceResult;
    };
    sdk: {
      input: ConfirmProductInstanceCommandInput;
      output: ConfirmProductInstanceCommandOutput;
    };
  };
}
