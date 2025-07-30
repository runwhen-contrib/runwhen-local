import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateSecurityGroupRequest,
  CreateSecurityGroupResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateSecurityGroupCommandInput
  extends CreateSecurityGroupRequest {}
export interface CreateSecurityGroupCommandOutput
  extends CreateSecurityGroupResult,
    __MetadataBearer {}
declare const CreateSecurityGroupCommand_base: {
  new (
    input: CreateSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSecurityGroupCommandInput,
    CreateSecurityGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSecurityGroupCommandInput,
    CreateSecurityGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateSecurityGroupCommand extends CreateSecurityGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateSecurityGroupRequest;
      output: CreateSecurityGroupResult;
    };
    sdk: {
      input: CreateSecurityGroupCommandInput;
      output: CreateSecurityGroupCommandOutput;
    };
  };
}
