import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNetworkAclsRequest,
  DescribeNetworkAclsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNetworkAclsCommandInput
  extends DescribeNetworkAclsRequest {}
export interface DescribeNetworkAclsCommandOutput
  extends DescribeNetworkAclsResult,
    __MetadataBearer {}
declare const DescribeNetworkAclsCommand_base: {
  new (
    input: DescribeNetworkAclsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkAclsCommandInput,
    DescribeNetworkAclsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNetworkAclsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNetworkAclsCommandInput,
    DescribeNetworkAclsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNetworkAclsCommand extends DescribeNetworkAclsCommand_base {
  protected static __types: {
    api: {
      input: DescribeNetworkAclsRequest;
      output: DescribeNetworkAclsResult;
    };
    sdk: {
      input: DescribeNetworkAclsCommandInput;
      output: DescribeNetworkAclsCommandOutput;
    };
  };
}
