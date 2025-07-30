import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EnableHttpEndpointRequest,
  EnableHttpEndpointResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface EnableHttpEndpointCommandInput
  extends EnableHttpEndpointRequest {}
export interface EnableHttpEndpointCommandOutput
  extends EnableHttpEndpointResponse,
    __MetadataBearer {}
declare const EnableHttpEndpointCommand_base: {
  new (
    input: EnableHttpEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableHttpEndpointCommandInput,
    EnableHttpEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: EnableHttpEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableHttpEndpointCommandInput,
    EnableHttpEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableHttpEndpointCommand extends EnableHttpEndpointCommand_base {
  protected static __types: {
    api: {
      input: EnableHttpEndpointRequest;
      output: EnableHttpEndpointResponse;
    };
    sdk: {
      input: EnableHttpEndpointCommandInput;
      output: EnableHttpEndpointCommandOutput;
    };
  };
}
