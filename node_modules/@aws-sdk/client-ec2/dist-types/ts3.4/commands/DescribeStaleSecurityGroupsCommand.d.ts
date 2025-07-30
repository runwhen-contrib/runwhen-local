import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeStaleSecurityGroupsRequest,
  DescribeStaleSecurityGroupsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeStaleSecurityGroupsCommandInput
  extends DescribeStaleSecurityGroupsRequest {}
export interface DescribeStaleSecurityGroupsCommandOutput
  extends DescribeStaleSecurityGroupsResult,
    __MetadataBearer {}
declare const DescribeStaleSecurityGroupsCommand_base: {
  new (
    input: DescribeStaleSecurityGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeStaleSecurityGroupsCommandInput,
    DescribeStaleSecurityGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeStaleSecurityGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeStaleSecurityGroupsCommandInput,
    DescribeStaleSecurityGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeStaleSecurityGroupsCommand extends DescribeStaleSecurityGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeStaleSecurityGroupsRequest;
      output: DescribeStaleSecurityGroupsResult;
    };
    sdk: {
      input: DescribeStaleSecurityGroupsCommandInput;
      output: DescribeStaleSecurityGroupsCommandOutput;
    };
  };
}
