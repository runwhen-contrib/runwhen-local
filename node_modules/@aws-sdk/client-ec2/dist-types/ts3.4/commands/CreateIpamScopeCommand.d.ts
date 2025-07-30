import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateIpamScopeRequest,
  CreateIpamScopeResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateIpamScopeCommandInput extends CreateIpamScopeRequest {}
export interface CreateIpamScopeCommandOutput
  extends CreateIpamScopeResult,
    __MetadataBearer {}
declare const CreateIpamScopeCommand_base: {
  new (
    input: CreateIpamScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamScopeCommandInput,
    CreateIpamScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateIpamScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamScopeCommandInput,
    CreateIpamScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateIpamScopeCommand extends CreateIpamScopeCommand_base {
  protected static __types: {
    api: {
      input: CreateIpamScopeRequest;
      output: CreateIpamScopeResult;
    };
    sdk: {
      input: CreateIpamScopeCommandInput;
      output: CreateIpamScopeCommandOutput;
    };
  };
}
