import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ReplaceNetworkAclEntryRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceNetworkAclEntryCommandInput
  extends ReplaceNetworkAclEntryRequest {}
export interface ReplaceNetworkAclEntryCommandOutput extends __MetadataBearer {}
declare const ReplaceNetworkAclEntryCommand_base: {
  new (
    input: ReplaceNetworkAclEntryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceNetworkAclEntryCommandInput,
    ReplaceNetworkAclEntryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceNetworkAclEntryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceNetworkAclEntryCommandInput,
    ReplaceNetworkAclEntryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceNetworkAclEntryCommand extends ReplaceNetworkAclEntryCommand_base {
  protected static __types: {
    api: {
      input: ReplaceNetworkAclEntryRequest;
      output: {};
    };
    sdk: {
      input: ReplaceNetworkAclEntryCommandInput;
      output: ReplaceNetworkAclEntryCommandOutput;
    };
  };
}
