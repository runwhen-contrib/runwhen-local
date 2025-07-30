import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpamByoasnRequest,
  DescribeIpamByoasnResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamByoasnCommandInput
  extends DescribeIpamByoasnRequest {}
export interface DescribeIpamByoasnCommandOutput
  extends DescribeIpamByoasnResult,
    __MetadataBearer {}
declare const DescribeIpamByoasnCommand_base: {
  new (
    input: DescribeIpamByoasnCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamByoasnCommandInput,
    DescribeIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIpamByoasnCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamByoasnCommandInput,
    DescribeIpamByoasnCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamByoasnCommand extends DescribeIpamByoasnCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamByoasnRequest;
      output: DescribeIpamByoasnResult;
    };
    sdk: {
      input: DescribeIpamByoasnCommandInput;
      output: DescribeIpamByoasnCommandOutput;
    };
  };
}
