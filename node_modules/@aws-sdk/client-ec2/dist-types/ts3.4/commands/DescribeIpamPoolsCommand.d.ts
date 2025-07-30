import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpamPoolsRequest,
  DescribeIpamPoolsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamPoolsCommandInput
  extends DescribeIpamPoolsRequest {}
export interface DescribeIpamPoolsCommandOutput
  extends DescribeIpamPoolsResult,
    __MetadataBearer {}
declare const DescribeIpamPoolsCommand_base: {
  new (
    input: DescribeIpamPoolsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamPoolsCommandInput,
    DescribeIpamPoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpamPoolsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamPoolsCommandInput,
    DescribeIpamPoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamPoolsCommand extends DescribeIpamPoolsCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamPoolsRequest;
      output: DescribeIpamPoolsResult;
    };
    sdk: {
      input: DescribeIpamPoolsCommandInput;
      output: DescribeIpamPoolsCommandOutput;
    };
  };
}
