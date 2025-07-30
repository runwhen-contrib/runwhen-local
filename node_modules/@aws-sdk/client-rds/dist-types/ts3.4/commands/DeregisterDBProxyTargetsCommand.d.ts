import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeregisterDBProxyTargetsRequest,
  DeregisterDBProxyTargetsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeregisterDBProxyTargetsCommandInput
  extends DeregisterDBProxyTargetsRequest {}
export interface DeregisterDBProxyTargetsCommandOutput
  extends DeregisterDBProxyTargetsResponse,
    __MetadataBearer {}
declare const DeregisterDBProxyTargetsCommand_base: {
  new (
    input: DeregisterDBProxyTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterDBProxyTargetsCommandInput,
    DeregisterDBProxyTargetsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeregisterDBProxyTargetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterDBProxyTargetsCommandInput,
    DeregisterDBProxyTargetsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeregisterDBProxyTargetsCommand extends DeregisterDBProxyTargetsCommand_base {
  protected static __types: {
    api: {
      input: DeregisterDBProxyTargetsRequest;
      output: {};
    };
    sdk: {
      input: DeregisterDBProxyTargetsCommandInput;
      output: DeregisterDBProxyTargetsCommandOutput;
    };
  };
}
