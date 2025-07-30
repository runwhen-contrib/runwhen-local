import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSpotDatafeedSubscriptionRequest,
  DescribeSpotDatafeedSubscriptionResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSpotDatafeedSubscriptionCommandInput
  extends DescribeSpotDatafeedSubscriptionRequest {}
export interface DescribeSpotDatafeedSubscriptionCommandOutput
  extends DescribeSpotDatafeedSubscriptionResult,
    __MetadataBearer {}
declare const DescribeSpotDatafeedSubscriptionCommand_base: {
  new (
    input: DescribeSpotDatafeedSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotDatafeedSubscriptionCommandInput,
    DescribeSpotDatafeedSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSpotDatafeedSubscriptionCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotDatafeedSubscriptionCommandInput,
    DescribeSpotDatafeedSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSpotDatafeedSubscriptionCommand extends DescribeSpotDatafeedSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: DescribeSpotDatafeedSubscriptionRequest;
      output: DescribeSpotDatafeedSubscriptionResult;
    };
    sdk: {
      input: DescribeSpotDatafeedSubscriptionCommandInput;
      output: DescribeSpotDatafeedSubscriptionCommandOutput;
    };
  };
}
