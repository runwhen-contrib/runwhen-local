import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcPeeringConnectionsRequest,
  DescribeVpcPeeringConnectionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcPeeringConnectionsCommandInput
  extends DescribeVpcPeeringConnectionsRequest {}
export interface DescribeVpcPeeringConnectionsCommandOutput
  extends DescribeVpcPeeringConnectionsResult,
    __MetadataBearer {}
declare const DescribeVpcPeeringConnectionsCommand_base: {
  new (
    input: DescribeVpcPeeringConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcPeeringConnectionsCommandInput,
    DescribeVpcPeeringConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcPeeringConnectionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcPeeringConnectionsCommandInput,
    DescribeVpcPeeringConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcPeeringConnectionsCommand extends DescribeVpcPeeringConnectionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcPeeringConnectionsRequest;
      output: DescribeVpcPeeringConnectionsResult;
    };
    sdk: {
      input: DescribeVpcPeeringConnectionsCommandInput;
      output: DescribeVpcPeeringConnectionsCommandOutput;
    };
  };
}
