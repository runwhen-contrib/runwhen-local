import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVpcEndpointServiceConfigurationRequest,
  CreateVpcEndpointServiceConfigurationResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVpcEndpointServiceConfigurationCommandInput
  extends CreateVpcEndpointServiceConfigurationRequest {}
export interface CreateVpcEndpointServiceConfigurationCommandOutput
  extends CreateVpcEndpointServiceConfigurationResult,
    __MetadataBearer {}
declare const CreateVpcEndpointServiceConfigurationCommand_base: {
  new (
    input: CreateVpcEndpointServiceConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcEndpointServiceConfigurationCommandInput,
    CreateVpcEndpointServiceConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateVpcEndpointServiceConfigurationCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcEndpointServiceConfigurationCommandInput,
    CreateVpcEndpointServiceConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVpcEndpointServiceConfigurationCommand extends CreateVpcEndpointServiceConfigurationCommand_base {
  protected static __types: {
    api: {
      input: CreateVpcEndpointServiceConfigurationRequest;
      output: CreateVpcEndpointServiceConfigurationResult;
    };
    sdk: {
      input: CreateVpcEndpointServiceConfigurationCommandInput;
      output: CreateVpcEndpointServiceConfigurationCommandOutput;
    };
  };
}
