import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBClusterMessage,
  CreateDBClusterResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBClusterCommandInput extends CreateDBClusterMessage {}
export interface CreateDBClusterCommandOutput
  extends CreateDBClusterResult,
    __MetadataBearer {}
declare const CreateDBClusterCommand_base: {
  new (
    input: CreateDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterCommandInput,
    CreateDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterCommandInput,
    CreateDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBClusterCommand extends CreateDBClusterCommand_base {
  protected static __types: {
    api: {
      input: CreateDBClusterMessage;
      output: CreateDBClusterResult;
    };
    sdk: {
      input: CreateDBClusterCommandInput;
      output: CreateDBClusterCommandOutput;
    };
  };
}
