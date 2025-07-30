import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAggregateIdFormatRequest,
  DescribeAggregateIdFormatResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAggregateIdFormatCommandInput
  extends DescribeAggregateIdFormatRequest {}
export interface DescribeAggregateIdFormatCommandOutput
  extends DescribeAggregateIdFormatResult,
    __MetadataBearer {}
declare const DescribeAggregateIdFormatCommand_base: {
  new (
    input: DescribeAggregateIdFormatCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAggregateIdFormatCommandInput,
    DescribeAggregateIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAggregateIdFormatCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAggregateIdFormatCommandInput,
    DescribeAggregateIdFormatCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAggregateIdFormatCommand extends DescribeAggregateIdFormatCommand_base {
  protected static __types: {
    api: {
      input: DescribeAggregateIdFormatRequest;
      output: DescribeAggregateIdFormatResult;
    };
    sdk: {
      input: DescribeAggregateIdFormatCommandInput;
      output: DescribeAggregateIdFormatCommandOutput;
    };
  };
}
