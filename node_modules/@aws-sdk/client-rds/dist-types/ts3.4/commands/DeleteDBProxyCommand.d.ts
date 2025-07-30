import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBProxyRequest,
  DeleteDBProxyResponse,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBProxyCommandInput extends DeleteDBProxyRequest {}
export interface DeleteDBProxyCommandOutput
  extends DeleteDBProxyResponse,
    __MetadataBearer {}
declare const DeleteDBProxyCommand_base: {
  new (
    input: DeleteDBProxyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBProxyCommandInput,
    DeleteDBProxyCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBProxyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBProxyCommandInput,
    DeleteDBProxyCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBProxyCommand extends DeleteDBProxyCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBProxyRequest;
      output: DeleteDBProxyResponse;
    };
    sdk: {
      input: DeleteDBProxyCommandInput;
      output: DeleteDBProxyCommandOutput;
    };
  };
}
