import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribePublicIpv4PoolsRequest,
  DescribePublicIpv4PoolsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribePublicIpv4PoolsCommandInput
  extends DescribePublicIpv4PoolsRequest {}
export interface DescribePublicIpv4PoolsCommandOutput
  extends DescribePublicIpv4PoolsResult,
    __MetadataBearer {}
declare const DescribePublicIpv4PoolsCommand_base: {
  new (
    input: DescribePublicIpv4PoolsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePublicIpv4PoolsCommandInput,
    DescribePublicIpv4PoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribePublicIpv4PoolsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePublicIpv4PoolsCommandInput,
    DescribePublicIpv4PoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribePublicIpv4PoolsCommand extends DescribePublicIpv4PoolsCommand_base {
  protected static __types: {
    api: {
      input: DescribePublicIpv4PoolsRequest;
      output: DescribePublicIpv4PoolsResult;
    };
    sdk: {
      input: DescribePublicIpv4PoolsCommandInput;
      output: DescribePublicIpv4PoolsCommandOutput;
    };
  };
}
