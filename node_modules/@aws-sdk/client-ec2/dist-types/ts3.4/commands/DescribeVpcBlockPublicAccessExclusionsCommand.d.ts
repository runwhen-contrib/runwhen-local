import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcBlockPublicAccessExclusionsRequest,
  DescribeVpcBlockPublicAccessExclusionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcBlockPublicAccessExclusionsCommandInput
  extends DescribeVpcBlockPublicAccessExclusionsRequest {}
export interface DescribeVpcBlockPublicAccessExclusionsCommandOutput
  extends DescribeVpcBlockPublicAccessExclusionsResult,
    __MetadataBearer {}
declare const DescribeVpcBlockPublicAccessExclusionsCommand_base: {
  new (
    input: DescribeVpcBlockPublicAccessExclusionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcBlockPublicAccessExclusionsCommandInput,
    DescribeVpcBlockPublicAccessExclusionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcBlockPublicAccessExclusionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcBlockPublicAccessExclusionsCommandInput,
    DescribeVpcBlockPublicAccessExclusionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcBlockPublicAccessExclusionsCommand extends DescribeVpcBlockPublicAccessExclusionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcBlockPublicAccessExclusionsRequest;
      output: DescribeVpcBlockPublicAccessExclusionsResult;
    };
    sdk: {
      input: DescribeVpcBlockPublicAccessExclusionsCommandInput;
      output: DescribeVpcBlockPublicAccessExclusionsCommandOutput;
    };
  };
}
