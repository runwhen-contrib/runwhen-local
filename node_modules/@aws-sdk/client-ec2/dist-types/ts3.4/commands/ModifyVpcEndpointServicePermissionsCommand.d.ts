import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcEndpointServicePermissionsRequest,
  ModifyVpcEndpointServicePermissionsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcEndpointServicePermissionsCommandInput
  extends ModifyVpcEndpointServicePermissionsRequest {}
export interface ModifyVpcEndpointServicePermissionsCommandOutput
  extends ModifyVpcEndpointServicePermissionsResult,
    __MetadataBearer {}
declare const ModifyVpcEndpointServicePermissionsCommand_base: {
  new (
    input: ModifyVpcEndpointServicePermissionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointServicePermissionsCommandInput,
    ModifyVpcEndpointServicePermissionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcEndpointServicePermissionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointServicePermissionsCommandInput,
    ModifyVpcEndpointServicePermissionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcEndpointServicePermissionsCommand extends ModifyVpcEndpointServicePermissionsCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcEndpointServicePermissionsRequest;
      output: ModifyVpcEndpointServicePermissionsResult;
    };
    sdk: {
      input: ModifyVpcEndpointServicePermissionsCommandInput;
      output: ModifyVpcEndpointServicePermissionsCommandOutput;
    };
  };
}
