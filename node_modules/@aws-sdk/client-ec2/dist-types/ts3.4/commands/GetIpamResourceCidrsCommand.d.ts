import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamResourceCidrsRequest,
  GetIpamResourceCidrsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamResourceCidrsCommandInput
  extends GetIpamResourceCidrsRequest {}
export interface GetIpamResourceCidrsCommandOutput
  extends GetIpamResourceCidrsResult,
    __MetadataBearer {}
declare const GetIpamResourceCidrsCommand_base: {
  new (
    input: GetIpamResourceCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamResourceCidrsCommandInput,
    GetIpamResourceCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamResourceCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamResourceCidrsCommandInput,
    GetIpamResourceCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamResourceCidrsCommand extends GetIpamResourceCidrsCommand_base {
  protected static __types: {
    api: {
      input: GetIpamResourceCidrsRequest;
      output: GetIpamResourceCidrsResult;
    };
    sdk: {
      input: GetIpamResourceCidrsCommandInput;
      output: GetIpamResourceCidrsCommandOutput;
    };
  };
}
