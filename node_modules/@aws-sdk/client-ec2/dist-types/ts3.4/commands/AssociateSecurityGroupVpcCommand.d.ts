import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateSecurityGroupVpcRequest,
  AssociateSecurityGroupVpcResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateSecurityGroupVpcCommandInput
  extends AssociateSecurityGroupVpcRequest {}
export interface AssociateSecurityGroupVpcCommandOutput
  extends AssociateSecurityGroupVpcResult,
    __MetadataBearer {}
declare const AssociateSecurityGroupVpcCommand_base: {
  new (
    input: AssociateSecurityGroupVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateSecurityGroupVpcCommandInput,
    AssociateSecurityGroupVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateSecurityGroupVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateSecurityGroupVpcCommandInput,
    AssociateSecurityGroupVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateSecurityGroupVpcCommand extends AssociateSecurityGroupVpcCommand_base {
  protected static __types: {
    api: {
      input: AssociateSecurityGroupVpcRequest;
      output: AssociateSecurityGroupVpcResult;
    };
    sdk: {
      input: AssociateSecurityGroupVpcCommandInput;
      output: AssociateSecurityGroupVpcCommandOutput;
    };
  };
}
