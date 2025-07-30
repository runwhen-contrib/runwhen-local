import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSecurityGroupsRequest,
  DescribeSecurityGroupsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSecurityGroupsCommandInput
  extends DescribeSecurityGroupsRequest {}
export interface DescribeSecurityGroupsCommandOutput
  extends DescribeSecurityGroupsResult,
    __MetadataBearer {}
declare const DescribeSecurityGroupsCommand_base: {
  new (
    input: DescribeSecurityGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupsCommandInput,
    DescribeSecurityGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSecurityGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupsCommandInput,
    DescribeSecurityGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSecurityGroupsCommand extends DescribeSecurityGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSecurityGroupsRequest;
      output: DescribeSecurityGroupsResult;
    };
    sdk: {
      input: DescribeSecurityGroupsCommandInput;
      output: DescribeSecurityGroupsCommandOutput;
    };
  };
}
