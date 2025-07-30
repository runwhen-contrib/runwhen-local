import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateInstanceConnectEndpointRequest,
  CreateInstanceConnectEndpointResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateInstanceConnectEndpointCommandInput
  extends CreateInstanceConnectEndpointRequest {}
export interface CreateInstanceConnectEndpointCommandOutput
  extends CreateInstanceConnectEndpointResult,
    __MetadataBearer {}
declare const CreateInstanceConnectEndpointCommand_base: {
  new (
    input: CreateInstanceConnectEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInstanceConnectEndpointCommandInput,
    CreateInstanceConnectEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateInstanceConnectEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInstanceConnectEndpointCommandInput,
    CreateInstanceConnectEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateInstanceConnectEndpointCommand extends CreateInstanceConnectEndpointCommand_base {
  protected static __types: {
    api: {
      input: CreateInstanceConnectEndpointRequest;
      output: CreateInstanceConnectEndpointResult;
    };
    sdk: {
      input: CreateInstanceConnectEndpointCommandInput;
      output: CreateInstanceConnectEndpointCommandOutput;
    };
  };
}
