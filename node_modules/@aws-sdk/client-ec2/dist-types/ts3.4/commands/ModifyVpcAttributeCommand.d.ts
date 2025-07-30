import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ModifyVpcAttributeRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcAttributeCommandInput
  extends ModifyVpcAttributeRequest {}
export interface ModifyVpcAttributeCommandOutput extends __MetadataBearer {}
declare const ModifyVpcAttributeCommand_base: {
  new (
    input: ModifyVpcAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcAttributeCommandInput,
    ModifyVpcAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcAttributeCommandInput,
    ModifyVpcAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcAttributeCommand extends ModifyVpcAttributeCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcAttributeRequest;
      output: {};
    };
    sdk: {
      input: ModifyVpcAttributeCommandInput;
      output: ModifyVpcAttributeCommandOutput;
    };
  };
}
