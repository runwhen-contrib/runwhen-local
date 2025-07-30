import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayPolicyTablesRequest,
  DescribeTransitGatewayPolicyTablesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayPolicyTablesCommandInput
  extends DescribeTransitGatewayPolicyTablesRequest {}
export interface DescribeTransitGatewayPolicyTablesCommandOutput
  extends DescribeTransitGatewayPolicyTablesResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayPolicyTablesCommand_base: {
  new (
    input: DescribeTransitGatewayPolicyTablesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayPolicyTablesCommandInput,
    DescribeTransitGatewayPolicyTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayPolicyTablesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayPolicyTablesCommandInput,
    DescribeTransitGatewayPolicyTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayPolicyTablesCommand extends DescribeTransitGatewayPolicyTablesCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayPolicyTablesRequest;
      output: DescribeTransitGatewayPolicyTablesResult;
    };
    sdk: {
      input: DescribeTransitGatewayPolicyTablesCommandInput;
      output: DescribeTransitGatewayPolicyTablesCommandOutput;
    };
  };
}
