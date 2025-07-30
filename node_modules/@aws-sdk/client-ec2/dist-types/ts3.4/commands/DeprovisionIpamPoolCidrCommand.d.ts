import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeprovisionIpamPoolCidrRequest,
  DeprovisionIpamPoolCidrResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeprovisionIpamPoolCidrCommandInput
  extends DeprovisionIpamPoolCidrRequest {}
export interface DeprovisionIpamPoolCidrCommandOutput
  extends DeprovisionIpamPoolCidrResult,
    __MetadataBearer {}
declare const DeprovisionIpamPoolCidrCommand_base: {
  new (
    input: DeprovisionIpamPoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionIpamPoolCidrCommandInput,
    DeprovisionIpamPoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeprovisionIpamPoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeprovisionIpamPoolCidrCommandInput,
    DeprovisionIpamPoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeprovisionIpamPoolCidrCommand extends DeprovisionIpamPoolCidrCommand_base {
  protected static __types: {
    api: {
      input: DeprovisionIpamPoolCidrRequest;
      output: DeprovisionIpamPoolCidrResult;
    };
    sdk: {
      input: DeprovisionIpamPoolCidrCommandInput;
      output: DeprovisionIpamPoolCidrCommandOutput;
    };
  };
}
