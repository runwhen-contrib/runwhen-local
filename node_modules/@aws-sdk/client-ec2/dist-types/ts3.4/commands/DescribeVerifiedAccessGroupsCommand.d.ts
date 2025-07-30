import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVerifiedAccessGroupsRequest,
  DescribeVerifiedAccessGroupsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVerifiedAccessGroupsCommandInput
  extends DescribeVerifiedAccessGroupsRequest {}
export interface DescribeVerifiedAccessGroupsCommandOutput
  extends DescribeVerifiedAccessGroupsResult,
    __MetadataBearer {}
declare const DescribeVerifiedAccessGroupsCommand_base: {
  new (
    input: DescribeVerifiedAccessGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessGroupsCommandInput,
    DescribeVerifiedAccessGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVerifiedAccessGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVerifiedAccessGroupsCommandInput,
    DescribeVerifiedAccessGroupsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVerifiedAccessGroupsCommand extends DescribeVerifiedAccessGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVerifiedAccessGroupsRequest;
      output: DescribeVerifiedAccessGroupsResult;
    };
    sdk: {
      input: DescribeVerifiedAccessGroupsCommandInput;
      output: DescribeVerifiedAccessGroupsCommandOutput;
    };
  };
}
