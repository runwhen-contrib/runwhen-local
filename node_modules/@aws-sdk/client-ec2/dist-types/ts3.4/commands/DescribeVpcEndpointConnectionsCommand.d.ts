import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointConnectionsRequest,
  DescribeVpcEndpointConnectionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointConnectionsCommandInput
  extends DescribeVpcEndpointConnectionsRequest {}
export interface DescribeVpcEndpointConnectionsCommandOutput
  extends DescribeVpcEndpointConnectionsResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointConnectionsCommand_base: {
  new (
    input: DescribeVpcEndpointConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointConnectionsCommandInput,
    DescribeVpcEndpointConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcEndpointConnectionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointConnectionsCommandInput,
    DescribeVpcEndpointConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointConnectionsCommand extends DescribeVpcEndpointConnectionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointConnectionsRequest;
      output: DescribeVpcEndpointConnectionsResult;
    };
    sdk: {
      input: DescribeVpcEndpointConnectionsCommandInput;
      output: DescribeVpcEndpointConnectionsCommandOutput;
    };
  };
}
