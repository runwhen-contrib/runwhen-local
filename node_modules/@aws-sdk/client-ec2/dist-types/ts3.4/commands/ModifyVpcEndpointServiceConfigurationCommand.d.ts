import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcEndpointServiceConfigurationRequest,
  ModifyVpcEndpointServiceConfigurationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcEndpointServiceConfigurationCommandInput
  extends ModifyVpcEndpointServiceConfigurationRequest {}
export interface ModifyVpcEndpointServiceConfigurationCommandOutput
  extends ModifyVpcEndpointServiceConfigurationResult,
    __MetadataBearer {}
declare const ModifyVpcEndpointServiceConfigurationCommand_base: {
  new (
    input: ModifyVpcEndpointServiceConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointServiceConfigurationCommandInput,
    ModifyVpcEndpointServiceConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcEndpointServiceConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointServiceConfigurationCommandInput,
    ModifyVpcEndpointServiceConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcEndpointServiceConfigurationCommand extends ModifyVpcEndpointServiceConfigurationCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcEndpointServiceConfigurationRequest;
      output: ModifyVpcEndpointServiceConfigurationResult;
    };
    sdk: {
      input: ModifyVpcEndpointServiceConfigurationCommandInput;
      output: ModifyVpcEndpointServiceConfigurationCommandOutput;
    };
  };
}
