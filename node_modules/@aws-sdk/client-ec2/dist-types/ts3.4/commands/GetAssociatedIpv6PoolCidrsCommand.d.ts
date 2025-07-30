import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetAssociatedIpv6PoolCidrsRequest,
  GetAssociatedIpv6PoolCidrsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetAssociatedIpv6PoolCidrsCommandInput
  extends GetAssociatedIpv6PoolCidrsRequest {}
export interface GetAssociatedIpv6PoolCidrsCommandOutput
  extends GetAssociatedIpv6PoolCidrsResult,
    __MetadataBearer {}
declare const GetAssociatedIpv6PoolCidrsCommand_base: {
  new (
    input: GetAssociatedIpv6PoolCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetAssociatedIpv6PoolCidrsCommandInput,
    GetAssociatedIpv6PoolCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetAssociatedIpv6PoolCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetAssociatedIpv6PoolCidrsCommandInput,
    GetAssociatedIpv6PoolCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetAssociatedIpv6PoolCidrsCommand extends GetAssociatedIpv6PoolCidrsCommand_base {
  protected static __types: {
    api: {
      input: GetAssociatedIpv6PoolCidrsRequest;
      output: GetAssociatedIpv6PoolCidrsResult;
    };
    sdk: {
      input: GetAssociatedIpv6PoolCidrsCommandInput;
      output: GetAssociatedIpv6PoolCidrsCommandOutput;
    };
  };
}
