import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CopyOptionGroupMessage,
  CopyOptionGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CopyOptionGroupCommandInput extends CopyOptionGroupMessage {}
export interface CopyOptionGroupCommandOutput
  extends CopyOptionGroupResult,
    __MetadataBearer {}
declare const CopyOptionGroupCommand_base: {
  new (
    input: CopyOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyOptionGroupCommandInput,
    CopyOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CopyOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CopyOptionGroupCommandInput,
    CopyOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CopyOptionGroupCommand extends CopyOptionGroupCommand_base {
  protected static __types: {
    api: {
      input: CopyOptionGroupMessage;
      output: CopyOptionGroupResult;
    };
    sdk: {
      input: CopyOptionGroupCommandInput;
      output: CopyOptionGroupCommandOutput;
    };
  };
}
