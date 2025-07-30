import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayAttachmentsRequest,
  DescribeTransitGatewayAttachmentsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayAttachmentsCommandInput
  extends DescribeTransitGatewayAttachmentsRequest {}
export interface DescribeTransitGatewayAttachmentsCommandOutput
  extends DescribeTransitGatewayAttachmentsResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayAttachmentsCommand_base: {
  new (
    input: DescribeTransitGatewayAttachmentsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayAttachmentsCommandInput,
    DescribeTransitGatewayAttachmentsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayAttachmentsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayAttachmentsCommandInput,
    DescribeTransitGatewayAttachmentsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayAttachmentsCommand extends DescribeTransitGatewayAttachmentsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayAttachmentsRequest;
      output: DescribeTransitGatewayAttachmentsResult;
    };
    sdk: {
      input: DescribeTransitGatewayAttachmentsCommandInput;
      output: DescribeTransitGatewayAttachmentsCommandOutput;
    };
  };
}
