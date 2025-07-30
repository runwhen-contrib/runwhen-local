import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateIpamResourceDiscoveryRequest,
  AssociateIpamResourceDiscoveryResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateIpamResourceDiscoveryCommandInput
  extends AssociateIpamResourceDiscoveryRequest {}
export interface AssociateIpamResourceDiscoveryCommandOutput
  extends AssociateIpamResourceDiscoveryResult,
    __MetadataBearer {}
declare const AssociateIpamResourceDiscoveryCommand_base: {
  new (
    input: AssociateIpamResourceDiscoveryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateIpamResourceDiscoveryCommandInput,
    AssociateIpamResourceDiscoveryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateIpamResourceDiscoveryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateIpamResourceDiscoveryCommandInput,
    AssociateIpamResourceDiscoveryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateIpamResourceDiscoveryCommand extends AssociateIpamResourceDiscoveryCommand_base {
  protected static __types: {
    api: {
      input: AssociateIpamResourceDiscoveryRequest;
      output: AssociateIpamResourceDiscoveryResult;
    };
    sdk: {
      input: AssociateIpamResourceDiscoveryCommandInput;
      output: AssociateIpamResourceDiscoveryCommandOutput;
    };
  };
}
