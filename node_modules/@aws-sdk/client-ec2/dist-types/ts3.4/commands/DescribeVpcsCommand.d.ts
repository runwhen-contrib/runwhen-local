import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DescribeVpcsRequest, DescribeVpcsResult } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcsCommandInput extends DescribeVpcsRequest {}
export interface DescribeVpcsCommandOutput
  extends DescribeVpcsResult,
    __MetadataBearer {}
declare const DescribeVpcsCommand_base: {
  new (
    input: DescribeVpcsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcsCommandInput,
    DescribeVpcsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcsCommandInput,
    DescribeVpcsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcsCommand extends DescribeVpcsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcsRequest;
      output: DescribeVpcsResult;
    };
    sdk: {
      input: DescribeVpcsCommandInput;
      output: DescribeVpcsCommandOutput;
    };
  };
}
