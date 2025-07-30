import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeClientVpnTargetNetworksRequest,
  DescribeClientVpnTargetNetworksResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeClientVpnTargetNetworksCommandInput
  extends DescribeClientVpnTargetNetworksRequest {}
export interface DescribeClientVpnTargetNetworksCommandOutput
  extends DescribeClientVpnTargetNetworksResult,
    __MetadataBearer {}
declare const DescribeClientVpnTargetNetworksCommand_base: {
  new (
    input: DescribeClientVpnTargetNetworksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnTargetNetworksCommandInput,
    DescribeClientVpnTargetNetworksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeClientVpnTargetNetworksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnTargetNetworksCommandInput,
    DescribeClientVpnTargetNetworksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeClientVpnTargetNetworksCommand extends DescribeClientVpnTargetNetworksCommand_base {
  protected static __types: {
    api: {
      input: DescribeClientVpnTargetNetworksRequest;
      output: DescribeClientVpnTargetNetworksResult;
    };
    sdk: {
      input: DescribeClientVpnTargetNetworksCommandInput;
      output: DescribeClientVpnTargetNetworksCommandOutput;
    };
  };
}
