import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpnGatewaysRequest,
  DescribeVpnGatewaysResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpnGatewaysCommandInput
  extends DescribeVpnGatewaysRequest {}
export interface DescribeVpnGatewaysCommandOutput
  extends DescribeVpnGatewaysResult,
    __MetadataBearer {}
declare const DescribeVpnGatewaysCommand_base: {
  new (
    input: DescribeVpnGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpnGatewaysCommandInput,
    DescribeVpnGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpnGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpnGatewaysCommandInput,
    DescribeVpnGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpnGatewaysCommand extends DescribeVpnGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpnGatewaysRequest;
      output: DescribeVpnGatewaysResult;
    };
    sdk: {
      input: DescribeVpnGatewaysCommandInput;
      output: DescribeVpnGatewaysCommandOutput;
    };
  };
}
