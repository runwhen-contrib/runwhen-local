import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIpamExternalResourceVerificationTokensRequest,
  DescribeIpamExternalResourceVerificationTokensResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIpamExternalResourceVerificationTokensCommandInput
  extends DescribeIpamExternalResourceVerificationTokensRequest {}
export interface DescribeIpamExternalResourceVerificationTokensCommandOutput
  extends DescribeIpamExternalResourceVerificationTokensResult,
    __MetadataBearer {}
declare const DescribeIpamExternalResourceVerificationTokensCommand_base: {
  new (
    input: DescribeIpamExternalResourceVerificationTokensCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamExternalResourceVerificationTokensCommandInput,
    DescribeIpamExternalResourceVerificationTokensCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]:
      | []
      | [DescribeIpamExternalResourceVerificationTokensCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIpamExternalResourceVerificationTokensCommandInput,
    DescribeIpamExternalResourceVerificationTokensCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIpamExternalResourceVerificationTokensCommand extends DescribeIpamExternalResourceVerificationTokensCommand_base {
  protected static __types: {
    api: {
      input: DescribeIpamExternalResourceVerificationTokensRequest;
      output: DescribeIpamExternalResourceVerificationTokensResult;
    };
    sdk: {
      input: DescribeIpamExternalResourceVerificationTokensCommandInput;
      output: DescribeIpamExternalResourceVerificationTokensCommandOutput;
    };
  };
}
