import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBClusterEndpointMessage,
  DBClusterEndpoint,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBClusterEndpointCommandInput
  extends CreateDBClusterEndpointMessage {}
export interface CreateDBClusterEndpointCommandOutput
  extends DBClusterEndpoint,
    __MetadataBearer {}
declare const CreateDBClusterEndpointCommand_base: {
  new (
    input: CreateDBClusterEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterEndpointCommandInput,
    CreateDBClusterEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBClusterEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBClusterEndpointCommandInput,
    CreateDBClusterEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBClusterEndpointCommand extends CreateDBClusterEndpointCommand_base {
  protected static __types: {
    api: {
      input: CreateDBClusterEndpointMessage;
      output: DBClusterEndpoint;
    };
    sdk: {
      input: CreateDBClusterEndpointCommandInput;
      output: CreateDBClusterEndpointCommandOutput;
    };
  };
}
