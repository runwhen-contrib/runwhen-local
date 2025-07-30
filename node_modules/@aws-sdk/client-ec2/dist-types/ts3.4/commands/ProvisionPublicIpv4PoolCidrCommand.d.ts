import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ProvisionPublicIpv4PoolCidrRequest,
  ProvisionPublicIpv4PoolCidrResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ProvisionPublicIpv4PoolCidrCommandInput
  extends ProvisionPublicIpv4PoolCidrRequest {}
export interface ProvisionPublicIpv4PoolCidrCommandOutput
  extends ProvisionPublicIpv4PoolCidrResult,
    __MetadataBearer {}
declare const ProvisionPublicIpv4PoolCidrCommand_base: {
  new (
    input: ProvisionPublicIpv4PoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionPublicIpv4PoolCidrCommandInput,
    ProvisionPublicIpv4PoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ProvisionPublicIpv4PoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ProvisionPublicIpv4PoolCidrCommandInput,
    ProvisionPublicIpv4PoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ProvisionPublicIpv4PoolCidrCommand extends ProvisionPublicIpv4PoolCidrCommand_base {
  protected static __types: {
    api: {
      input: ProvisionPublicIpv4PoolCidrRequest;
      output: ProvisionPublicIpv4PoolCidrResult;
    };
    sdk: {
      input: ProvisionPublicIpv4PoolCidrCommandInput;
      output: ProvisionPublicIpv4PoolCidrCommandOutput;
    };
  };
}
