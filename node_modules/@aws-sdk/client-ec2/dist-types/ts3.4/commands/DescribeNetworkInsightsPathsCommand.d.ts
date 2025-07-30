import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkInsightsPathsRequest,
  DescribeNetworkInsightsPathsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkInsightsPathsCommandInput
  extends DescribeNetworkInsightsPathsRequest {}
export interface DescribeNetworkInsightsPathsCommandOutput
  extends DescribeNetworkInsightsPathsResult,
    __MetadataBearer {}
declare const DescribeNetworkInsightsPathsCommand_base: {
  new (
    input: DescribeNetworkInsightsPathsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsPathsCommandInput,
    DescribeNetworkInsightsPathsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkInsightsPathsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsPathsCommandInput,
    DescribeNetworkInsightsPathsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkInsightsPathsCommand extends DescribeNetworkInsightsPathsCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkInsightsPathsRequest;
      output: DescribeNetworkInsightsPathsResult;
    };
    sdk: {
      input: DescribeNetworkInsightsPathsCommandInput;
      output: DescribeNetworkInsightsPathsCommandOutput;
    };
  };
}
