import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayConnectsRequest,
  DescribeTransitGatewayConnectsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayConnectsCommandInput
  extends DescribeTransitGatewayConnectsRequest {}
export interface DescribeTransitGatewayConnectsCommandOutput
  extends DescribeTransitGatewayConnectsResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayConnectsCommand_base: {
  new (
    input: DescribeTransitGatewayConnectsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayConnectsCommandInput,
    DescribeTransitGatewayConnectsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayConnectsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayConnectsCommandInput,
    DescribeTransitGatewayConnectsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayConnectsCommand extends DescribeTransitGatewayConnectsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayConnectsRequest;
      output: DescribeTransitGatewayConnectsResult;
    };
    sdk: {
      input: DescribeTransitGatewayConnectsCommandInput;
      output: DescribeTransitGatewayConnectsCommandOutput;
    };
  };
}
