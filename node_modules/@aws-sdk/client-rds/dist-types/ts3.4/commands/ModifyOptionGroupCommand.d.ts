import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyOptionGroupMessage,
  ModifyOptionGroupResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyOptionGroupCommandInput
  extends ModifyOptionGroupMessage {}
export interface ModifyOptionGroupCommandOutput
  extends ModifyOptionGroupResult,
    __MetadataBearer {}
declare const ModifyOptionGroupCommand_base: {
  new (
    input: ModifyOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyOptionGroupCommandInput,
    ModifyOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyOptionGroupCommandInput,
    ModifyOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyOptionGroupCommand extends ModifyOptionGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyOptionGroupMessage;
      output: ModifyOptionGroupResult;
    };
    sdk: {
      input: ModifyOptionGroupCommandInput;
      output: ModifyOptionGroupCommandOutput;
    };
  };
}
