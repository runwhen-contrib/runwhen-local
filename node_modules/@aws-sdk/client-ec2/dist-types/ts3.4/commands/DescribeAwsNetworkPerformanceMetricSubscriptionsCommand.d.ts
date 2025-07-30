import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAwsNetworkPerformanceMetricSubscriptionsRequest,
  DescribeAwsNetworkPerformanceMetricSubscriptionsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput
  extends DescribeAwsNetworkPerformanceMetricSubscriptionsRequest {}
export interface DescribeAwsNetworkPerformanceMetricSubscriptionsCommandOutput
  extends DescribeAwsNetworkPerformanceMetricSubscriptionsResult,
    __MetadataBearer {}
declare const DescribeAwsNetworkPerformanceMetricSubscriptionsCommand_base: {
  new (
    input: DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput,
    DescribeAwsNetworkPerformanceMetricSubscriptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput,
    DescribeAwsNetworkPerformanceMetricSubscriptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAwsNetworkPerformanceMetricSubscriptionsCommand extends DescribeAwsNetworkPerformanceMetricSubscriptionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeAwsNetworkPerformanceMetricSubscriptionsRequest;
      output: DescribeAwsNetworkPerformanceMetricSubscriptionsResult;
    };
    sdk: {
      input: DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput;
      output: DescribeAwsNetworkPerformanceMetricSubscriptionsCommandOutput;
    };
  };
}
