import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBProxyRequest,
  CreateDBProxyResponse,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBProxyCommandInput extends CreateDBProxyRequest {}
export interface CreateDBProxyCommandOutput
  extends CreateDBProxyResponse,
    __MetadataBearer {}
declare const CreateDBProxyCommand_base: {
  new (
    input: CreateDBProxyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBProxyCommandInput,
    CreateDBProxyCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBProxyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBProxyCommandInput,
    CreateDBProxyCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBProxyCommand extends CreateDBProxyCommand_base {
  protected static __types: {
    api: {
      input: CreateDBProxyRequest;
      output: CreateDBProxyResponse;
    };
    sdk: {
      input: CreateDBProxyCommandInput;
      output: CreateDBProxyCommandOutput;
    };
  };
}
