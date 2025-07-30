import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBParameterGroupMessage,
  CreateDBParameterGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBParameterGroupCommandInput
  extends CreateDBParameterGroupMessage {}
export interface CreateDBParameterGroupCommandOutput
  extends CreateDBParameterGroupResult,
    __MetadataBearer {}
declare const CreateDBParameterGroupCommand_base: {
  new (
    input: CreateDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBParameterGroupCommandInput,
    CreateDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBParameterGroupCommandInput,
    CreateDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBParameterGroupCommand extends CreateDBParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateDBParameterGroupMessage;
      output: CreateDBParameterGroupResult;
    };
    sdk: {
      input: CreateDBParameterGroupCommandInput;
      output: CreateDBParameterGroupCommandOutput;
    };
  };
}
