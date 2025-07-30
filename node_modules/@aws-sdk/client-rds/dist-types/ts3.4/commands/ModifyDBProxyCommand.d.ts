import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBProxyRequest,
  ModifyDBProxyResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBProxyCommandInput extends ModifyDBProxyRequest {}
export interface ModifyDBProxyCommandOutput
  extends ModifyDBProxyResponse,
    __MetadataBearer {}
declare const ModifyDBProxyCommand_base: {
  new (
    input: ModifyDBProxyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBProxyCommandInput,
    ModifyDBProxyCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBProxyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBProxyCommandInput,
    ModifyDBProxyCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBProxyCommand extends ModifyDBProxyCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBProxyRequest;
      output: ModifyDBProxyResponse;
    };
    sdk: {
      input: ModifyDBProxyCommandInput;
      output: ModifyDBProxyCommandOutput;
    };
  };
}
