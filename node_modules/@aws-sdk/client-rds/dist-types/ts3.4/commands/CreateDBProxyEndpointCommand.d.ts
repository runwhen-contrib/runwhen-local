import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBProxyEndpointRequest,
  CreateDBProxyEndpointResponse,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBProxyEndpointCommandInput
  extends CreateDBProxyEndpointRequest {}
export interface CreateDBProxyEndpointCommandOutput
  extends CreateDBProxyEndpointResponse,
    __MetadataBearer {}
declare const CreateDBProxyEndpointCommand_base: {
  new (
    input: CreateDBProxyEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBProxyEndpointCommandInput,
    CreateDBProxyEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBProxyEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBProxyEndpointCommandInput,
    CreateDBProxyEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBProxyEndpointCommand extends CreateDBProxyEndpointCommand_base {
  protected static __types: {
    api: {
      input: CreateDBProxyEndpointRequest;
      output: CreateDBProxyEndpointResponse;
    };
    sdk: {
      input: CreateDBProxyEndpointCommandInput;
      output: CreateDBProxyEndpointCommandOutput;
    };
  };
}
