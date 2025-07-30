import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DisableHttpEndpointRequest,
  DisableHttpEndpointResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DisableHttpEndpointCommandInput
  extends DisableHttpEndpointRequest {}
export interface DisableHttpEndpointCommandOutput
  extends DisableHttpEndpointResponse,
    __MetadataBearer {}
declare const DisableHttpEndpointCommand_base: {
  new (
    input: DisableHttpEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableHttpEndpointCommandInput,
    DisableHttpEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableHttpEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableHttpEndpointCommandInput,
    DisableHttpEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableHttpEndpointCommand extends DisableHttpEndpointCommand_base {
  protected static __types: {
    api: {
      input: DisableHttpEndpointRequest;
      output: DisableHttpEndpointResponse;
    };
    sdk: {
      input: DisableHttpEndpointCommandInput;
      output: DisableHttpEndpointCommandOutput;
    };
  };
}
