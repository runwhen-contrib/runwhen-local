import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBProxyEndpointRequest,
  DeleteDBProxyEndpointResponse,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBProxyEndpointCommandInput
  extends DeleteDBProxyEndpointRequest {}
export interface DeleteDBProxyEndpointCommandOutput
  extends DeleteDBProxyEndpointResponse,
    __MetadataBearer {}
declare const DeleteDBProxyEndpointCommand_base: {
  new (
    input: DeleteDBProxyEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBProxyEndpointCommandInput,
    DeleteDBProxyEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBProxyEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBProxyEndpointCommandInput,
    DeleteDBProxyEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBProxyEndpointCommand extends DeleteDBProxyEndpointCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBProxyEndpointRequest;
      output: DeleteDBProxyEndpointResponse;
    };
    sdk: {
      input: DeleteDBProxyEndpointCommandInput;
      output: DeleteDBProxyEndpointCommandOutput;
    };
  };
}
