import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpv6PoolsRequest,
  DescribeIpv6PoolsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpv6PoolsCommandInput
  extends DescribeIpv6PoolsRequest {}
export interface DescribeIpv6PoolsCommandOutput
  extends DescribeIpv6PoolsResult,
    __MetadataBearer {}
declare const DescribeIpv6PoolsCommand_base: {
  new (
    input: DescribeIpv6PoolsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpv6PoolsCommandInput,
    DescribeIpv6PoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpv6PoolsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpv6PoolsCommandInput,
    DescribeIpv6PoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpv6PoolsCommand extends DescribeIpv6PoolsCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpv6PoolsRequest;
      output: DescribeIpv6PoolsResult;
    };
    sdk: {
      input: DescribeIpv6PoolsCommandInput;
      output: DescribeIpv6PoolsCommandOutput;
    };
  };
}
