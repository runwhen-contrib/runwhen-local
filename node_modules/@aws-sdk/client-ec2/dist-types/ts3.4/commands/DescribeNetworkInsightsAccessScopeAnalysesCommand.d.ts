import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkInsightsAccessScopeAnalysesRequest,
  DescribeNetworkInsightsAccessScopeAnalysesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkInsightsAccessScopeAnalysesCommandInput
  extends DescribeNetworkInsightsAccessScopeAnalysesRequest {}
export interface DescribeNetworkInsightsAccessScopeAnalysesCommandOutput
  extends DescribeNetworkInsightsAccessScopeAnalysesResult,
    __MetadataBearer {}
declare const DescribeNetworkInsightsAccessScopeAnalysesCommand_base: {
  new (
    input: DescribeNetworkInsightsAccessScopeAnalysesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsAccessScopeAnalysesCommandInput,
    DescribeNetworkInsightsAccessScopeAnalysesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkInsightsAccessScopeAnalysesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsAccessScopeAnalysesCommandInput,
    DescribeNetworkInsightsAccessScopeAnalysesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkInsightsAccessScopeAnalysesCommand extends DescribeNetworkInsightsAccessScopeAnalysesCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkInsightsAccessScopeAnalysesRequest;
      output: DescribeNetworkInsightsAccessScopeAnalysesResult;
    };
    sdk: {
      input: DescribeNetworkInsightsAccessScopeAnalysesCommandInput;
      output: DescribeNetworkInsightsAccessScopeAnalysesCommandOutput;
    };
  };
}
