import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamDiscoveredPublicAddressesRequest,
  GetIpamDiscoveredPublicAddressesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamDiscoveredPublicAddressesCommandInput
  extends GetIpamDiscoveredPublicAddressesRequest {}
export interface GetIpamDiscoveredPublicAddressesCommandOutput
  extends GetIpamDiscoveredPublicAddressesResult,
    __MetadataBearer {}
declare const GetIpamDiscoveredPublicAddressesCommand_base: {
  new (
    input: GetIpamDiscoveredPublicAddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamDiscoveredPublicAddressesCommandInput,
    GetIpamDiscoveredPublicAddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamDiscoveredPublicAddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamDiscoveredPublicAddressesCommandInput,
    GetIpamDiscoveredPublicAddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamDiscoveredPublicAddressesCommand extends GetIpamDiscoveredPublicAddressesCommand_base {
  protected static __types: {
    api: {
      input: GetIpamDiscoveredPublicAddressesRequest;
      output: GetIpamDiscoveredPublicAddressesResult;
    };
    sdk: {
      input: GetIpamDiscoveredPublicAddressesCommandInput;
      output: GetIpamDiscoveredPublicAddressesCommandOutput;
    };
  };
}
