import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamDiscoveredAccountsRequest,
  GetIpamDiscoveredAccountsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamDiscoveredAccountsCommandInput
  extends GetIpamDiscoveredAccountsRequest {}
export interface GetIpamDiscoveredAccountsCommandOutput
  extends GetIpamDiscoveredAccountsResult,
    __MetadataBearer {}
declare const GetIpamDiscoveredAccountsCommand_base: {
  new (
    input: GetIpamDiscoveredAccountsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamDiscoveredAccountsCommandInput,
    GetIpamDiscoveredAccountsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamDiscoveredAccountsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamDiscoveredAccountsCommandInput,
    GetIpamDiscoveredAccountsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamDiscoveredAccountsCommand extends GetIpamDiscoveredAccountsCommand_base {
  protected static __types: {
    api: {
      input: GetIpamDiscoveredAccountsRequest;
      output: GetIpamDiscoveredAccountsResult;
    };
    sdk: {
      input: GetIpamDiscoveredAccountsCommandInput;
      output: GetIpamDiscoveredAccountsCommandOutput;
    };
  };
}
