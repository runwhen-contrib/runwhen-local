import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcEndpointServicePayerResponsibilityRequest,
  ModifyVpcEndpointServicePayerResponsibilityResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcEndpointServicePayerResponsibilityCommandInput
  extends ModifyVpcEndpointServicePayerResponsibilityRequest {}
export interface ModifyVpcEndpointServicePayerResponsibilityCommandOutput
  extends ModifyVpcEndpointServicePayerResponsibilityResult,
    __MetadataBearer {}
declare const ModifyVpcEndpointServicePayerResponsibilityCommand_base: {
  new (
    input: ModifyVpcEndpointServicePayerResponsibilityCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointServicePayerResponsibilityCommandInput,
    ModifyVpcEndpointServicePayerResponsibilityCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcEndpointServicePayerResponsibilityCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointServicePayerResponsibilityCommandInput,
    ModifyVpcEndpointServicePayerResponsibilityCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcEndpointServicePayerResponsibilityCommand extends ModifyVpcEndpointServicePayerResponsibilityCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcEndpointServicePayerResponsibilityRequest;
      output: ModifyVpcEndpointServicePayerResponsibilityResult;
    };
    sdk: {
      input: ModifyVpcEndpointServicePayerResponsibilityCommandInput;
      output: ModifyVpcEndpointServicePayerResponsibilityCommandOutput;
    };
  };
}
