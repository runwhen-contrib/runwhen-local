import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeRouteServerPeersRequest,
  DescribeRouteServerPeersResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeRouteServerPeersCommandInput
  extends DescribeRouteServerPeersRequest {}
export interface DescribeRouteServerPeersCommandOutput
  extends DescribeRouteServerPeersResult,
    __MetadataBearer {}
declare const DescribeRouteServerPeersCommand_base: {
  new (
    input: DescribeRouteServerPeersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteServerPeersCommandInput,
    DescribeRouteServerPeersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeRouteServerPeersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteServerPeersCommandInput,
    DescribeRouteServerPeersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeRouteServerPeersCommand extends DescribeRouteServerPeersCommand_base {
  protected static __types: {
    api: {
      input: DescribeRouteServerPeersRequest;
      output: DescribeRouteServerPeersResult;
    };
    sdk: {
      input: DescribeRouteServerPeersCommandInput;
      output: DescribeRouteServerPeersCommandOutput;
    };
  };
}
