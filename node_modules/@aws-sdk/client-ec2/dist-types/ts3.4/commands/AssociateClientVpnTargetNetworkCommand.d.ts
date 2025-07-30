import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateClientVpnTargetNetworkRequest,
  AssociateClientVpnTargetNetworkResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateClientVpnTargetNetworkCommandInput
  extends AssociateClientVpnTargetNetworkRequest {}
export interface AssociateClientVpnTargetNetworkCommandOutput
  extends AssociateClientVpnTargetNetworkResult,
    __MetadataBearer {}
declare const AssociateClientVpnTargetNetworkCommand_base: {
  new (
    input: AssociateClientVpnTargetNetworkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateClientVpnTargetNetworkCommandInput,
    AssociateClientVpnTargetNetworkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateClientVpnTargetNetworkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateClientVpnTargetNetworkCommandInput,
    AssociateClientVpnTargetNetworkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateClientVpnTargetNetworkCommand extends AssociateClientVpnTargetNetworkCommand_base {
  protected static __types: {
    api: {
      input: AssociateClientVpnTargetNetworkRequest;
      output: AssociateClientVpnTargetNetworkResult;
    };
    sdk: {
      input: AssociateClientVpnTargetNetworkCommandInput;
      output: AssociateClientVpnTargetNetworkCommandOutput;
    };
  };
}
