import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeRouteTablesRequest,
  DescribeRouteTablesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeRouteTablesCommandInput
  extends DescribeRouteTablesRequest {}
export interface DescribeRouteTablesCommandOutput
  extends DescribeRouteTablesResult,
    __MetadataBearer {}
declare const DescribeRouteTablesCommand_base: {
  new (
    input: DescribeRouteTablesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteTablesCommandInput,
    DescribeRouteTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeRouteTablesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteTablesCommandInput,
    DescribeRouteTablesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeRouteTablesCommand extends DescribeRouteTablesCommand_base {
  protected static __types: {
    api: {
      input: DescribeRouteTablesRequest;
      output: DescribeRouteTablesResult;
    };
    sdk: {
      input: DescribeRouteTablesCommandInput;
      output: DescribeRouteTablesCommandOutput;
    };
  };
}
