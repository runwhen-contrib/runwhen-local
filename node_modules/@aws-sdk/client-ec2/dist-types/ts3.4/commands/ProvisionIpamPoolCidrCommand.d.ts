import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ProvisionIpamPoolCidrRequest,
  ProvisionIpamPoolCidrResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ProvisionIpamPoolCidrCommandInput
  extends ProvisionIpamPoolCidrRequest {}
export interface ProvisionIpamPoolCidrCommandOutput
  extends ProvisionIpamPoolCidrResult,
    __MetadataBearer {}
declare const ProvisionIpamPoolCidrCommand_base: {
  new (
    input: ProvisionIpamPoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionIpamPoolCidrCommandInput,
    ProvisionIpamPoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ProvisionIpamPoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionIpamPoolCidrCommandInput,
    ProvisionIpamPoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ProvisionIpamPoolCidrCommand extends ProvisionIpamPoolCidrCommand_base {
  protected static __types: {
    api: {
      input: ProvisionIpamPoolCidrRequest;
      output: ProvisionIpamPoolCidrResult;
    };
    sdk: {
      input: ProvisionIpamPoolCidrCommandInput;
      output: ProvisionIpamPoolCidrCommandOutput;
    };
  };
}
