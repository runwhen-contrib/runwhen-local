import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkInsightsAnalysesRequest,
  DescribeNetworkInsightsAnalysesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkInsightsAnalysesCommandInput
  extends DescribeNetworkInsightsAnalysesRequest {}
export interface DescribeNetworkInsightsAnalysesCommandOutput
  extends DescribeNetworkInsightsAnalysesResult,
    __MetadataBearer {}
declare const DescribeNetworkInsightsAnalysesCommand_base: {
  new (
    input: DescribeNetworkInsightsAnalysesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsAnalysesCommandInput,
    DescribeNetworkInsightsAnalysesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkInsightsAnalysesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkInsightsAnalysesCommandInput,
    DescribeNetworkInsightsAnalysesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkInsightsAnalysesCommand extends DescribeNetworkInsightsAnalysesCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkInsightsAnalysesRequest;
      output: DescribeNetworkInsightsAnalysesResult;
    };
    sdk: {
      input: DescribeNetworkInsightsAnalysesCommandInput;
      output: DescribeNetworkInsightsAnalysesCommandOutput;
    };
  };
}
