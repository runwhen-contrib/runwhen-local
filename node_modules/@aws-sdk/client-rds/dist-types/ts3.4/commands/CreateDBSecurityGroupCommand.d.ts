import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBSecurityGroupMessage,
  CreateDBSecurityGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBSecurityGroupCommandInput
  extends CreateDBSecurityGroupMessage {}
export interface CreateDBSecurityGroupCommandOutput
  extends CreateDBSecurityGroupResult,
    __MetadataBearer {}
declare const CreateDBSecurityGroupCommand_base: {
  new (
    input: CreateDBSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBSecurityGroupCommandInput,
    CreateDBSecurityGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBSecurityGroupCommandInput,
    CreateDBSecurityGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBSecurityGroupCommand extends CreateDBSecurityGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateDBSecurityGroupMessage;
      output: CreateDBSecurityGroupResult;
    };
    sdk: {
      input: CreateDBSecurityGroupCommandInput;
      output: CreateDBSecurityGroupCommandOutput;
    };
  };
}
