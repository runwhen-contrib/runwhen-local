import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCoipPoolsRequest,
  DescribeCoipPoolsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCoipPoolsCommandInput
  extends DescribeCoipPoolsRequest {}
export interface DescribeCoipPoolsCommandOutput
  extends DescribeCoipPoolsResult,
    __MetadataBearer {}
declare const DescribeCoipPoolsCommand_base: {
  new (
    input: DescribeCoipPoolsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCoipPoolsCommandInput,
    DescribeCoipPoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCoipPoolsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCoipPoolsCommandInput,
    DescribeCoipPoolsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCoipPoolsCommand extends DescribeCoipPoolsCommand_base {
  protected static __types: {
    api: {
      input: DescribeCoipPoolsRequest;
      output: DescribeCoipPoolsResult;
    };
    sdk: {
      input: DescribeCoipPoolsCommandInput;
      output: DescribeCoipPoolsCommandOutput;
    };
  };
}
