import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateOptionGroupMessage,
  CreateOptionGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateOptionGroupCommandInput
  extends CreateOptionGroupMessage {}
export interface CreateOptionGroupCommandOutput
  extends CreateOptionGroupResult,
    __MetadataBearer {}
declare const CreateOptionGroupCommand_base: {
  new (
    input: CreateOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateOptionGroupCommandInput,
    CreateOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateOptionGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateOptionGroupCommandInput,
    CreateOptionGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateOptionGroupCommand extends CreateOptionGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateOptionGroupMessage;
      output: CreateOptionGroupResult;
    };
    sdk: {
      input: CreateOptionGroupCommandInput;
      output: CreateOptionGroupCommandOutput;
    };
  };
}
