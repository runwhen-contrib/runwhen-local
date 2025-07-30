import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceEventNotificationAttributesRequest,
  DescribeInstanceEventNotificationAttributesResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceEventNotificationAttributesCommandInput
  extends DescribeInstanceEventNotificationAttributesRequest {}
export interface DescribeInstanceEventNotificationAttributesCommandOutput
  extends DescribeInstanceEventNotificationAttributesResult,
    __MetadataBearer {}
declare const DescribeInstanceEventNotificationAttributesCommand_base: {
  new (
    input: DescribeInstanceEventNotificationAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceEventNotificationAttributesCommandInput,
    DescribeInstanceEventNotificationAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceEventNotificationAttributesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceEventNotificationAttributesCommandInput,
    DescribeInstanceEventNotificationAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceEventNotificationAttributesCommand extends DescribeInstanceEventNotificationAttributesCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceEventNotificationAttributesRequest;
      output: DescribeInstanceEventNotificationAttributesResult;
    };
    sdk: {
      input: DescribeInstanceEventNotificationAttributesCommandInput;
      output: DescribeInstanceEventNotificationAttributesCommandOutput;
    };
  };
}
