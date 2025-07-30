import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcClassicLinkDnsSupportRequest,
  DescribeVpcClassicLinkDnsSupportResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcClassicLinkDnsSupportCommandInput
  extends DescribeVpcClassicLinkDnsSupportRequest {}
export interface DescribeVpcClassicLinkDnsSupportCommandOutput
  extends DescribeVpcClassicLinkDnsSupportResult,
    __MetadataBearer {}
declare const DescribeVpcClassicLinkDnsSupportCommand_base: {
  new (
    input: DescribeVpcClassicLinkDnsSupportCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcClassicLinkDnsSupportCommandInput,
    DescribeVpcClassicLinkDnsSupportCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcClassicLinkDnsSupportCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcClassicLinkDnsSupportCommandInput,
    DescribeVpcClassicLinkDnsSupportCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcClassicLinkDnsSupportCommand extends DescribeVpcClassicLinkDnsSupportCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcClassicLinkDnsSupportRequest;
      output: DescribeVpcClassicLinkDnsSupportResult;
    };
    sdk: {
      input: DescribeVpcClassicLinkDnsSupportCommandInput;
      output: DescribeVpcClassicLinkDnsSupportCommandOutput;
    };
  };
}
