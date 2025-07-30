import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DescribeTagsRequest, DescribeTagsResult } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTagsCommandInput extends DescribeTagsRequest {}
export interface DescribeTagsCommandOutput
  extends DescribeTagsResult,
    __MetadataBearer {}
declare const DescribeTagsCommand_base: {
  new (
    input: DescribeTagsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTagsCommandInput,
    DescribeTagsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTagsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTagsCommandInput,
    DescribeTagsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTagsCommand extends DescribeTagsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTagsRequest;
      output: DescribeTagsResult;
    };
    sdk: {
      input: DescribeTagsCommandInput;
      output: DescribeTagsCommandOutput;
    };
  };
}
