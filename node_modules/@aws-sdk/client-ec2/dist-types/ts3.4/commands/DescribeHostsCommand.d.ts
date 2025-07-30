import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DescribeHostsRequest, DescribeHostsResult } from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeHostsCommandInput extends DescribeHostsRequest {}
export interface DescribeHostsCommandOutput
  extends DescribeHostsResult,
    __MetadataBearer {}
declare const DescribeHostsCommand_base: {
  new (
    input: DescribeHostsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeHostsCommandInput,
    DescribeHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeHostsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeHostsCommandInput,
    DescribeHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeHostsCommand extends DescribeHostsCommand_base {
  protected static __types: {
    api: {
      input: DescribeHostsRequest;
      output: DescribeHostsResult;
    };
    sdk: {
      input: DescribeHostsCommandInput;
      output: DescribeHostsCommandOutput;
    };
  };
}
