import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateIpamPoolRequest,
  CreateIpamPoolResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateIpamPoolCommandInput extends CreateIpamPoolRequest {}
export interface CreateIpamPoolCommandOutput
  extends CreateIpamPoolResult,
    __MetadataBearer {}
declare const CreateIpamPoolCommand_base: {
  new (
    input: CreateIpamPoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamPoolCommandInput,
    CreateIpamPoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateIpamPoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamPoolCommandInput,
    CreateIpamPoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateIpamPoolCommand extends CreateIpamPoolCommand_base {
  protected static __types: {
    api: {
      input: CreateIpamPoolRequest;
      output: CreateIpamPoolResult;
    };
    sdk: {
      input: CreateIpamPoolCommandInput;
      output: CreateIpamPoolCommandOutput;
    };
  };
}
