import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcBlockPublicAccessOptionsRequest,
  DescribeVpcBlockPublicAccessOptionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcBlockPublicAccessOptionsCommandInput
  extends DescribeVpcBlockPublicAccessOptionsRequest {}
export interface DescribeVpcBlockPublicAccessOptionsCommandOutput
  extends DescribeVpcBlockPublicAccessOptionsResult,
    __MetadataBearer {}
declare const DescribeVpcBlockPublicAccessOptionsCommand_base: {
  new (
    input: DescribeVpcBlockPublicAccessOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcBlockPublicAccessOptionsCommandInput,
    DescribeVpcBlockPublicAccessOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcBlockPublicAccessOptionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcBlockPublicAccessOptionsCommandInput,
    DescribeVpcBlockPublicAccessOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcBlockPublicAccessOptionsCommand extends DescribeVpcBlockPublicAccessOptionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcBlockPublicAccessOptionsRequest;
      output: DescribeVpcBlockPublicAccessOptionsResult;
    };
    sdk: {
      input: DescribeVpcBlockPublicAccessOptionsCommandInput;
      output: DescribeVpcBlockPublicAccessOptionsCommandOutput;
    };
  };
}
