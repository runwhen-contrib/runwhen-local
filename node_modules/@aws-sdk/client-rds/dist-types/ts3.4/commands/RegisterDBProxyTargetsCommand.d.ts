import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RegisterDBProxyTargetsRequest,
  RegisterDBProxyTargetsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RegisterDBProxyTargetsCommandInput
  extends RegisterDBProxyTargetsRequest {}
export interface RegisterDBProxyTargetsCommandOutput
  extends RegisterDBProxyTargetsResponse,
    __MetadataBearer {}
declare const RegisterDBProxyTargetsCommand_base: {
  new (
    input: RegisterDBProxyTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterDBProxyTargetsCommandInput,
    RegisterDBProxyTargetsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RegisterDBProxyTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterDBProxyTargetsCommandInput,
    RegisterDBProxyTargetsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RegisterDBProxyTargetsCommand extends RegisterDBProxyTargetsCommand_base {
  protected static __types: {
    api: {
      input: RegisterDBProxyTargetsRequest;
      output: RegisterDBProxyTargetsResponse;
    };
    sdk: {
      input: RegisterDBProxyTargetsCommandInput;
      output: RegisterDBProxyTargetsCommandOutput;
    };
  };
}
