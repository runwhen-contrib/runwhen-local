import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkInsightsAccessScopesRequest,
  DescribeNetworkInsightsAccessScopesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkInsightsAccessScopesCommandInput
  extends DescribeNetworkInsightsAccessScopesRequest {}
export interface DescribeNetworkInsightsAccessScopesCommandOutput
  extends DescribeNetworkInsightsAccessScopesResult,
    __MetadataBearer {}
declare const DescribeNetworkInsightsAccessScopesCommand_base: {
  new (
    input: DescribeNetworkInsightsAccessScopesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsAccessScopesCommandInput,
    DescribeNetworkInsightsAccessScopesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkInsightsAccessScopesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsAccessScopesCommandInput,
    DescribeNetworkInsightsAccessScopesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkInsightsAccessScopesCommand extends DescribeNetworkInsightsAccessScopesCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkInsightsAccessScopesRequest;
      output: DescribeNetworkInsightsAccessScopesResult;
    };
    sdk: {
      input: DescribeNetworkInsightsAccessScopesCommandInput;
      output: DescribeNetworkInsightsAccessScopesCommandOutput;
    };
  };
}
