import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVpcEndpointRequest,
  CreateVpcEndpointResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVpcEndpointCommandInput
  extends CreateVpcEndpointRequest {}
export interface CreateVpcEndpointCommandOutput
  extends CreateVpcEndpointResult,
    __MetadataBearer {}
declare const CreateVpcEndpointCommand_base: {
  new (
    input: CreateVpcEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcEndpointCommandInput,
    CreateVpcEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVpcEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcEndpointCommandInput,
    CreateVpcEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVpcEndpointCommand extends CreateVpcEndpointCommand_base {
  protected static __types: {
    api: {
      input: CreateVpcEndpointRequest;
      output: CreateVpcEndpointResult;
    };
    sdk: {
      input: CreateVpcEndpointCommandInput;
      output: CreateVpcEndpointCommandOutput;
    };
  };
}
