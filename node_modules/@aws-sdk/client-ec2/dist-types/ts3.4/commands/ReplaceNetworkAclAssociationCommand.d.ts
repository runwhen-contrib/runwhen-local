import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReplaceNetworkAclAssociationRequest,
  ReplaceNetworkAclAssociationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceNetworkAclAssociationCommandInput
  extends ReplaceNetworkAclAssociationRequest {}
export interface ReplaceNetworkAclAssociationCommandOutput
  extends ReplaceNetworkAclAssociationResult,
    __MetadataBearer {}
declare const ReplaceNetworkAclAssociationCommand_base: {
  new (
    input: ReplaceNetworkAclAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceNetworkAclAssociationCommandInput,
    ReplaceNetworkAclAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceNetworkAclAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceNetworkAclAssociationCommandInput,
    ReplaceNetworkAclAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceNetworkAclAssociationCommand extends ReplaceNetworkAclAssociationCommand_base {
  protected static __types: {
    api: {
      input: ReplaceNetworkAclAssociationRequest;
      output: ReplaceNetworkAclAssociationResult;
    };
    sdk: {
      input: ReplaceNetworkAclAssociationCommandInput;
      output: ReplaceNetworkAclAssociationCommandOutput;
    };
  };
}
