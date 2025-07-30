import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateNetworkAclEntryRequest } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateNetworkAclEntryCommandInput
  extends CreateNetworkAclEntryRequest {}
export interface CreateNetworkAclEntryCommandOutput extends __MetadataBearer {}
declare const CreateNetworkAclEntryCommand_base: {
  new (
    input: CreateNetworkAclEntryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkAclEntryCommandInput,
    CreateNetworkAclEntryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateNetworkAclEntryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkAclEntryCommandInput,
    CreateNetworkAclEntryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateNetworkAclEntryCommand extends CreateNetworkAclEntryCommand_base {
  protected static __types: {
    api: {
      input: CreateNetworkAclEntryRequest;
      output: {};
    };
    sdk: {
      input: CreateNetworkAclEntryCommandInput;
      output: CreateNetworkAclEntryCommandOutput;
    };
  };
}
