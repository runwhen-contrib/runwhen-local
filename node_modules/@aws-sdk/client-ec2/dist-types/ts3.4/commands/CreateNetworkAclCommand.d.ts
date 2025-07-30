import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateNetworkAclRequest,
  CreateNetworkAclResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateNetworkAclCommandInput extends CreateNetworkAclRequest {}
export interface CreateNetworkAclCommandOutput
  extends CreateNetworkAclResult,
    __MetadataBearer {}
declare const CreateNetworkAclCommand_base: {
  new (
    input: CreateNetworkAclCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkAclCommandInput,
    CreateNetworkAclCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateNetworkAclCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkAclCommandInput,
    CreateNetworkAclCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateNetworkAclCommand extends CreateNetworkAclCommand_base {
  protected static __types: {
    api: {
      input: CreateNetworkAclRequest;
      output: CreateNetworkAclResult;
    };
    sdk: {
      input: CreateNetworkAclCommandInput;
      output: CreateNetworkAclCommandOutput;
    };
  };
}
