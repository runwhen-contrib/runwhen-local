import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcEndpointRequest,
  ModifyVpcEndpointResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcEndpointCommandInput
  extends ModifyVpcEndpointRequest {}
export interface ModifyVpcEndpointCommandOutput
  extends ModifyVpcEndpointResult,
    __MetadataBearer {}
declare const ModifyVpcEndpointCommand_base: {
  new (
    input: ModifyVpcEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointCommandInput,
    ModifyVpcEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointCommandInput,
    ModifyVpcEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcEndpointCommand extends ModifyVpcEndpointCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcEndpointRequest;
      output: ModifyVpcEndpointResult;
    };
    sdk: {
      input: ModifyVpcEndpointCommandInput;
      output: ModifyVpcEndpointCommandOutput;
    };
  };
}
