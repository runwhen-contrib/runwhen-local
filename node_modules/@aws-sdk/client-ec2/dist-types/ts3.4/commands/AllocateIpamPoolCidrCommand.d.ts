import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AllocateIpamPoolCidrRequest,
  AllocateIpamPoolCidrResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AllocateIpamPoolCidrCommandInput
  extends AllocateIpamPoolCidrRequest {}
export interface AllocateIpamPoolCidrCommandOutput
  extends AllocateIpamPoolCidrResult,
    __MetadataBearer {}
declare const AllocateIpamPoolCidrCommand_base: {
  new (
    input: AllocateIpamPoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AllocateIpamPoolCidrCommandInput,
    AllocateIpamPoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AllocateIpamPoolCidrCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AllocateIpamPoolCidrCommandInput,
    AllocateIpamPoolCidrCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AllocateIpamPoolCidrCommand extends AllocateIpamPoolCidrCommand_base {
  protected static __types: {
    api: {
      input: AllocateIpamPoolCidrRequest;
      output: AllocateIpamPoolCidrResult;
    };
    sdk: {
      input: AllocateIpamPoolCidrCommandInput;
      output: AllocateIpamPoolCidrCommandOutput;
    };
  };
}
