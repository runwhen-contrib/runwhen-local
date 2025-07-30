import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeClientVpnConnectionsRequest,
  DescribeClientVpnConnectionsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeClientVpnConnectionsCommandInput
  extends DescribeClientVpnConnectionsRequest {}
export interface DescribeClientVpnConnectionsCommandOutput
  extends DescribeClientVpnConnectionsResult,
    __MetadataBearer {}
declare const DescribeClientVpnConnectionsCommand_base: {
  new (
    input: DescribeClientVpnConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnConnectionsCommandInput,
    DescribeClientVpnConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeClientVpnConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnConnectionsCommandInput,
    DescribeClientVpnConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeClientVpnConnectionsCommand extends DescribeClientVpnConnectionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeClientVpnConnectionsRequest;
      output: DescribeClientVpnConnectionsResult;
    };
    sdk: {
      input: DescribeClientVpnConnectionsCommandInput;
      output: DescribeClientVpnConnectionsCommandOutput;
    };
  };
}
