import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBClusterParameterGroupMessage,
  CreateDBClusterParameterGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBClusterParameterGroupCommandInput
  extends CreateDBClusterParameterGroupMessage {}
export interface CreateDBClusterParameterGroupCommandOutput
  extends CreateDBClusterParameterGroupResult,
    __MetadataBearer {}
declare const CreateDBClusterParameterGroupCommand_base: {
  new (
    input: CreateDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterParameterGroupCommandInput,
    CreateDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterParameterGroupCommandInput,
    CreateDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBClusterParameterGroupCommand extends CreateDBClusterParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateDBClusterParameterGroupMessage;
      output: CreateDBClusterParameterGroupResult;
    };
    sdk: {
      input: CreateDBClusterParameterGroupCommandInput;
      output: CreateDBClusterParameterGroupCommandOutput;
    };
  };
}
