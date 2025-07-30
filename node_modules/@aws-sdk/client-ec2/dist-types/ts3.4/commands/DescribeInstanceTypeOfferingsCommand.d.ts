import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceTypeOfferingsRequest,
  DescribeInstanceTypeOfferingsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceTypeOfferingsCommandInput
  extends DescribeInstanceTypeOfferingsRequest {}
export interface DescribeInstanceTypeOfferingsCommandOutput
  extends DescribeInstanceTypeOfferingsResult,
    __MetadataBearer {}
declare const DescribeInstanceTypeOfferingsCommand_base: {
  new (
    input: DescribeInstanceTypeOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceTypeOfferingsCommandInput,
    DescribeInstanceTypeOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceTypeOfferingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceTypeOfferingsCommandInput,
    DescribeInstanceTypeOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceTypeOfferingsCommand extends DescribeInstanceTypeOfferingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceTypeOfferingsRequest;
      output: DescribeInstanceTypeOfferingsResult;
    };
    sdk: {
      input: DescribeInstanceTypeOfferingsCommandInput;
      output: DescribeInstanceTypeOfferingsCommandOutput;
    };
  };
}
