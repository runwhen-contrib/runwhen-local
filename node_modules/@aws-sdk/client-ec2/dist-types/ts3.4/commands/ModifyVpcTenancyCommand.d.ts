import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcTenancyRequest,
  ModifyVpcTenancyResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcTenancyCommandInput extends ModifyVpcTenancyRequest {}
export interface ModifyVpcTenancyCommandOutput
  extends ModifyVpcTenancyResult,
    __MetadataBearer {}
declare const ModifyVpcTenancyCommand_base: {
  new (
    input: ModifyVpcTenancyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcTenancyCommandInput,
    ModifyVpcTenancyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcTenancyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcTenancyCommandInput,
    ModifyVpcTenancyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcTenancyCommand extends ModifyVpcTenancyCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcTenancyRequest;
      output: ModifyVpcTenancyResult;
    };
    sdk: {
      input: ModifyVpcTenancyCommandInput;
      output: ModifyVpcTenancyCommandOutput;
    };
  };
}
