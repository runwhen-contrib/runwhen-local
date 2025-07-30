import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamPoolCidrsRequest,
  GetIpamPoolCidrsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamPoolCidrsCommandInput extends GetIpamPoolCidrsRequest {}
export interface GetIpamPoolCidrsCommandOutput
  extends GetIpamPoolCidrsResult,
    __MetadataBearer {}
declare const GetIpamPoolCidrsCommand_base: {
  new (
    input: GetIpamPoolCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamPoolCidrsCommandInput,
    GetIpamPoolCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamPoolCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamPoolCidrsCommandInput,
    GetIpamPoolCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamPoolCidrsCommand extends GetIpamPoolCidrsCommand_base {
  protected static __types: {
    api: {
      input: GetIpamPoolCidrsRequest;
      output: GetIpamPoolCidrsResult;
    };
    sdk: {
      input: GetIpamPoolCidrsCommandInput;
      output: GetIpamPoolCidrsCommandOutput;
    };
  };
}
