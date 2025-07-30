import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayVpcAttachmentsRequest,
  DescribeTransitGatewayVpcAttachmentsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayVpcAttachmentsCommandInput
  extends DescribeTransitGatewayVpcAttachmentsRequest {}
export interface DescribeTransitGatewayVpcAttachmentsCommandOutput
  extends DescribeTransitGatewayVpcAttachmentsResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayVpcAttachmentsCommand_base: {
  new (
    input: DescribeTransitGatewayVpcAttachmentsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayVpcAttachmentsCommandInput,
    DescribeTransitGatewayVpcAttachmentsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayVpcAttachmentsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayVpcAttachmentsCommandInput,
    DescribeTransitGatewayVpcAttachmentsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayVpcAttachmentsCommand extends DescribeTransitGatewayVpcAttachmentsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayVpcAttachmentsRequest;
      output: DescribeTransitGatewayVpcAttachmentsResult;
    };
    sdk: {
      input: DescribeTransitGatewayVpcAttachmentsCommandInput;
      output: DescribeTransitGatewayVpcAttachmentsCommandOutput;
    };
  };
}
