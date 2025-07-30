import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpnConnectionsRequest,
  DescribeVpnConnectionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpnConnectionsCommandInput
  extends DescribeVpnConnectionsRequest {}
export interface DescribeVpnConnectionsCommandOutput
  extends DescribeVpnConnectionsResult,
    __MetadataBearer {}
declare const DescribeVpnConnectionsCommand_base: {
  new (
    input: DescribeVpnConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpnConnectionsCommandInput,
    DescribeVpnConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpnConnectionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpnConnectionsCommandInput,
    DescribeVpnConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpnConnectionsCommand extends DescribeVpnConnectionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpnConnectionsRequest;
      output: DescribeVpnConnectionsResult;
    };
    sdk: {
      input: DescribeVpnConnectionsCommandInput;
      output: DescribeVpnConnectionsCommandOutput;
    };
  };
}
