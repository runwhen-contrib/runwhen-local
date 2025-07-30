import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableAwsNetworkPerformanceMetricSubscriptionRequest,
  DisableAwsNetworkPerformanceMetricSubscriptionResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableAwsNetworkPerformanceMetricSubscriptionCommandInput
  extends DisableAwsNetworkPerformanceMetricSubscriptionRequest {}
export interface DisableAwsNetworkPerformanceMetricSubscriptionCommandOutput
  extends DisableAwsNetworkPerformanceMetricSubscriptionResult,
    __MetadataBearer {}
declare const DisableAwsNetworkPerformanceMetricSubscriptionCommand_base: {
  new (
    input: DisableAwsNetworkPerformanceMetricSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableAwsNetworkPerformanceMetricSubscriptionCommandInput,
    DisableAwsNetworkPerformanceMetricSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [DisableAwsNetworkPerformanceMetricSubscriptionCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableAwsNetworkPerformanceMetricSubscriptionCommandInput,
    DisableAwsNetworkPerformanceMetricSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableAwsNetworkPerformanceMetricSubscriptionCommand extends DisableAwsNetworkPerformanceMetricSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: DisableAwsNetworkPerformanceMetricSubscriptionRequest;
      output: DisableAwsNetworkPerformanceMetricSubscriptionResult;
    };
    sdk: {
      input: DisableAwsNetworkPerformanceMetricSubscriptionCommandInput;
      output: DisableAwsNetworkPerformanceMetricSubscriptionCommandOutput;
    };
  };
}
