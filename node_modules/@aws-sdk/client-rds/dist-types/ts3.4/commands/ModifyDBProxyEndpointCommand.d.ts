import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBProxyEndpointRequest,
  ModifyDBProxyEndpointResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBProxyEndpointCommandInput
  extends ModifyDBProxyEndpointRequest {}
export interface ModifyDBProxyEndpointCommandOutput
  extends ModifyDBProxyEndpointResponse,
    __MetadataBearer {}
declare const ModifyDBProxyEndpointCommand_base: {
  new (
    input: ModifyDBProxyEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBProxyEndpointCommandInput,
    ModifyDBProxyEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBProxyEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBProxyEndpointCommandInput,
    ModifyDBProxyEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBProxyEndpointCommand extends ModifyDBProxyEndpointCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBProxyEndpointRequest;
      output: ModifyDBProxyEndpointResponse;
    };
    sdk: {
      input: ModifyDBProxyEndpointCommandInput;
      output: ModifyDBProxyEndpointCommandOutput;
    };
  };
}
