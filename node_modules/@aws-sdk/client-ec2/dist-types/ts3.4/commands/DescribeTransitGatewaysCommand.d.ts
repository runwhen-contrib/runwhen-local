import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewaysRequest,
  DescribeTransitGatewaysResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewaysCommandInput
  extends DescribeTransitGatewaysRequest {}
export interface DescribeTransitGatewaysCommandOutput
  extends DescribeTransitGatewaysResult,
    __MetadataBearer {}
declare const DescribeTransitGatewaysCommand_base: {
  new (
    input: DescribeTransitGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewaysCommandInput,
    DescribeTransitGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewaysCommandInput,
    DescribeTransitGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewaysCommand extends DescribeTransitGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewaysRequest;
      output: DescribeTransitGatewaysResult;
    };
    sdk: {
      input: DescribeTransitGatewaysCommandInput;
      output: DescribeTransitGatewaysCommandOutput;
    };
  };
}
