import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ApplySecurityGroupsToClientVpnTargetNetworkRequest,
  ApplySecurityGroupsToClientVpnTargetNetworkResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface ApplySecurityGroupsToClientVpnTargetNetworkCommandInput
  extends ApplySecurityGroupsToClientVpnTargetNetworkRequest {}
export interface ApplySecurityGroupsToClientVpnTargetNetworkCommandOutput
  extends ApplySecurityGroupsToClientVpnTargetNetworkResult,
    __MetadataBearer {}
declare const ApplySecurityGroupsToClientVpnTargetNetworkCommand_base: {
  new (
    input: ApplySecurityGroupsToClientVpnTargetNetworkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ApplySecurityGroupsToClientVpnTargetNetworkCommandInput,
    ApplySecurityGroupsToClientVpnTargetNetworkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ApplySecurityGroupsToClientVpnTargetNetworkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ApplySecurityGroupsToClientVpnTargetNetworkCommandInput,
    ApplySecurityGroupsToClientVpnTargetNetworkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ApplySecurityGroupsToClientVpnTargetNetworkCommand extends ApplySecurityGroupsToClientVpnTargetNetworkCommand_base {
  protected static __types: {
    api: {
      input: ApplySecurityGroupsToClientVpnTargetNetworkRequest;
      output: ApplySecurityGroupsToClientVpnTargetNetworkResult;
    };
    sdk: {
      input: ApplySecurityGroupsToClientVpnTargetNetworkCommandInput;
      output: ApplySecurityGroupsToClientVpnTargetNetworkCommandOutput;
    };
  };
}
