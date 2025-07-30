import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTransitGatewayConnectPeersRequest,
  DescribeTransitGatewayConnectPeersResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTransitGatewayConnectPeersCommandInput
  extends DescribeTransitGatewayConnectPeersRequest {}
export interface DescribeTransitGatewayConnectPeersCommandOutput
  extends DescribeTransitGatewayConnectPeersResult,
    __MetadataBearer {}
declare const DescribeTransitGatewayConnectPeersCommand_base: {
  new (
    input: DescribeTransitGatewayConnectPeersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayConnectPeersCommandInput,
    DescribeTransitGatewayConnectPeersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTransitGatewayConnectPeersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTransitGatewayConnectPeersCommandInput,
    DescribeTransitGatewayConnectPeersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTransitGatewayConnectPeersCommand extends DescribeTransitGatewayConnectPeersCommand_base {
  protected static __types: {
    api: {
      input: DescribeTransitGatewayConnectPeersRequest;
      output: DescribeTransitGatewayConnectPeersResult;
    };
    sdk: {
      input: DescribeTransitGatewayConnectPeersCommandInput;
      output: DescribeTransitGatewayConnectPeersCommandOutput;
    };
  };
}
