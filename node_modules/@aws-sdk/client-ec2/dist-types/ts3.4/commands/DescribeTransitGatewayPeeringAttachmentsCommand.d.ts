import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayPeeringAttachmentsRequest,
  DescribeTransitGatewayPeeringAttachmentsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayPeeringAttachmentsCommandInput
  extends DescribeTransitGatewayPeeringAttachmentsRequest {}
export interface DescribeTransitGatewayPeeringAttachmentsCommandOutput
  extends DescribeTransitGatewayPeeringAttachmentsResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayPeeringAttachmentsCommand_base: {
  new (
    input: DescribeTransitGatewayPeeringAttachmentsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayPeeringAttachmentsCommandInput,
    DescribeTransitGatewayPeeringAttachmentsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayPeeringAttachmentsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayPeeringAttachmentsCommandInput,
    DescribeTransitGatewayPeeringAttachmentsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayPeeringAttachmentsCommand extends DescribeTransitGatewayPeeringAttachmentsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayPeeringAttachmentsRequest;
      output: DescribeTransitGatewayPeeringAttachmentsResult;
    };
    sdk: {
      input: DescribeTransitGatewayPeeringAttachmentsCommandInput;
      output: DescribeTransitGatewayPeeringAttachmentsCommandOutput;
    };
  };
}
