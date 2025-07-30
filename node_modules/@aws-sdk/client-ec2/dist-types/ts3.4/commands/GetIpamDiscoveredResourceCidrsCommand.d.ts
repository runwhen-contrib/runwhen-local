import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamDiscoveredResourceCidrsRequest,
  GetIpamDiscoveredResourceCidrsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamDiscoveredResourceCidrsCommandInput
  extends GetIpamDiscoveredResourceCidrsRequest {}
export interface GetIpamDiscoveredResourceCidrsCommandOutput
  extends GetIpamDiscoveredResourceCidrsResult,
    __MetadataBearer {}
declare const GetIpamDiscoveredResourceCidrsCommand_base: {
  new (
    input: GetIpamDiscoveredResourceCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamDiscoveredResourceCidrsCommandInput,
    GetIpamDiscoveredResourceCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamDiscoveredResourceCidrsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamDiscoveredResourceCidrsCommandInput,
    GetIpamDiscoveredResourceCidrsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamDiscoveredResourceCidrsCommand extends GetIpamDiscoveredResourceCidrsCommand_base {
  protected static __types: {
    api: {
      input: GetIpamDiscoveredResourceCidrsRequest;
      output: GetIpamDiscoveredResourceCidrsResult;
    };
    sdk: {
      input: GetIpamDiscoveredResourceCidrsCommandInput;
      output: GetIpamDiscoveredResourceCidrsCommandOutput;
    };
  };
}
