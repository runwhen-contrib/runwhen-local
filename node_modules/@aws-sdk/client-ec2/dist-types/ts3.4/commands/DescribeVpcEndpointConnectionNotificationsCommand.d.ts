import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointConnectionNotificationsRequest,
  DescribeVpcEndpointConnectionNotificationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointConnectionNotificationsCommandInput
  extends DescribeVpcEndpointConnectionNotificationsRequest {}
export interface DescribeVpcEndpointConnectionNotificationsCommandOutput
  extends DescribeVpcEndpointConnectionNotificationsResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointConnectionNotificationsCommand_base: {
  new (
    input: DescribeVpcEndpointConnectionNotificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointConnectionNotificationsCommandInput,
    DescribeVpcEndpointConnectionNotificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcEndpointConnectionNotificationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointConnectionNotificationsCommandInput,
    DescribeVpcEndpointConnectionNotificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointConnectionNotificationsCommand extends DescribeVpcEndpointConnectionNotificationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointConnectionNotificationsRequest;
      output: DescribeVpcEndpointConnectionNotificationsResult;
    };
    sdk: {
      input: DescribeVpcEndpointConnectionNotificationsCommandInput;
      output: DescribeVpcEndpointConnectionNotificationsCommandOutput;
    };
  };
}
