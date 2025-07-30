import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeprovisionPublicIpv4PoolCidrRequest,
  DeprovisionPublicIpv4PoolCidrResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeprovisionPublicIpv4PoolCidrCommandInput
  extends DeprovisionPublicIpv4PoolCidrRequest {}
export interface DeprovisionPublicIpv4PoolCidrCommandOutput
  extends DeprovisionPublicIpv4PoolCidrResult,
    __MetadataBearer {}
declare const DeprovisionPublicIpv4PoolCidrCommand_base: {
  new (
    input: DeprovisionPublicIpv4PoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionPublicIpv4PoolCidrCommandInput,
    DeprovisionPublicIpv4PoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeprovisionPublicIpv4PoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionPublicIpv4PoolCidrCommandInput,
    DeprovisionPublicIpv4PoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeprovisionPublicIpv4PoolCidrCommand extends DeprovisionPublicIpv4PoolCidrCommand_base {
  protected static __types: {
    api: {
      input: DeprovisionPublicIpv4PoolCidrRequest;
      output: DeprovisionPublicIpv4PoolCidrResult;
    };
    sdk: {
      input: DeprovisionPublicIpv4PoolCidrCommandInput;
      output: DeprovisionPublicIpv4PoolCidrCommandOutput;
    };
  };
}
