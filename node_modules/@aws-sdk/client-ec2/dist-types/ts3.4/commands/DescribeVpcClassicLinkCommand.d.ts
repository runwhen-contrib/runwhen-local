import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcClassicLinkRequest,
  DescribeVpcClassicLinkResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcClassicLinkCommandInput
  extends DescribeVpcClassicLinkRequest {}
export interface DescribeVpcClassicLinkCommandOutput
  extends DescribeVpcClassicLinkResult,
    __MetadataBearer {}
declare const DescribeVpcClassicLinkCommand_base: {
  new (
    input: DescribeVpcClassicLinkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcClassicLinkCommandInput,
    DescribeVpcClassicLinkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcClassicLinkCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcClassicLinkCommandInput,
    DescribeVpcClassicLinkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcClassicLinkCommand extends DescribeVpcClassicLinkCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcClassicLinkRequest;
      output: DescribeVpcClassicLinkResult;
    };
    sdk: {
      input: DescribeVpcClassicLinkCommandInput;
      output: DescribeVpcClassicLinkCommandOutput;
    };
  };
}
