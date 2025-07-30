import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DescribeIpamsRequest, DescribeIpamsResult } from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamsCommandInput extends DescribeIpamsRequest {}
export interface DescribeIpamsCommandOutput
  extends DescribeIpamsResult,
    __MetadataBearer {}
declare const DescribeIpamsCommand_base: {
  new (
    input: DescribeIpamsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamsCommandInput,
    DescribeIpamsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpamsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamsCommandInput,
    DescribeIpamsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamsCommand extends DescribeIpamsCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamsRequest;
      output: DescribeIpamsResult;
    };
    sdk: {
      input: DescribeIpamsCommandInput;
      output: DescribeIpamsCommandOutput;
    };
  };
}
