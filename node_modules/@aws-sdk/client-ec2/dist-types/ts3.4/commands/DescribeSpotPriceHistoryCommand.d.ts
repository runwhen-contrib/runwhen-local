import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSpotPriceHistoryRequest,
  DescribeSpotPriceHistoryResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSpotPriceHistoryCommandInput
  extends DescribeSpotPriceHistoryRequest {}
export interface DescribeSpotPriceHistoryCommandOutput
  extends DescribeSpotPriceHistoryResult,
    __MetadataBearer {}
declare const DescribeSpotPriceHistoryCommand_base: {
  new (
    input: DescribeSpotPriceHistoryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotPriceHistoryCommandInput,
    DescribeSpotPriceHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSpotPriceHistoryCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSpotPriceHistoryCommandInput,
    DescribeSpotPriceHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSpotPriceHistoryCommand extends DescribeSpotPriceHistoryCommand_base {
  protected static __types: {
    api: {
      input: DescribeSpotPriceHistoryRequest;
      output: DescribeSpotPriceHistoryResult;
    };
    sdk: {
      input: DescribeSpotPriceHistoryCommandInput;
      output: DescribeSpotPriceHistoryCommandOutput;
    };
  };
}
