import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  EnableAwsNetworkPerformanceMetricSubscriptionRequest,
  EnableAwsNetworkPerformanceMetricSubscriptionResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableAwsNetworkPerformanceMetricSubscriptionCommandInput
  extends EnableAwsNetworkPerformanceMetricSubscriptionRequest {}
export interface EnableAwsNetworkPerformanceMetricSubscriptionCommandOutput
  extends EnableAwsNetworkPerformanceMetricSubscriptionResult,
    __MetadataBearer {}
declare const EnableAwsNetworkPerformanceMetricSubscriptionCommand_base: {
  new (
    input: EnableAwsNetworkPerformanceMetricSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableAwsNetworkPerformanceMetricSubscriptionCommandInput,
    EnableAwsNetworkPerformanceMetricSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [EnableAwsNetworkPerformanceMetricSubscriptionCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    EnableAwsNetworkPerformanceMetricSubscriptionCommandInput,
    EnableAwsNetworkPerformanceMetricSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableAwsNetworkPerformanceMetricSubscriptionCommand extends EnableAwsNetworkPerformanceMetricSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: EnableAwsNetworkPerformanceMetricSubscriptionRequest;
      output: EnableAwsNetworkPerformanceMetricSubscriptionResult;
    };
    sdk: {
      input: EnableAwsNetworkPerformanceMetricSubscriptionCommandInput;
      output: EnableAwsNetworkPerformanceMetricSubscriptionCommandOutput;
    };
  };
}
