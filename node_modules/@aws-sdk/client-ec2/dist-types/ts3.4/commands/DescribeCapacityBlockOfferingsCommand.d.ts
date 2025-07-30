import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCapacityBlockOfferingsRequest,
  DescribeCapacityBlockOfferingsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCapacityBlockOfferingsCommandInput
  extends DescribeCapacityBlockOfferingsRequest {}
export interface DescribeCapacityBlockOfferingsCommandOutput
  extends DescribeCapacityBlockOfferingsResult,
    __MetadataBearer {}
declare const DescribeCapacityBlockOfferingsCommand_base: {
  new (
    input: DescribeCapacityBlockOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityBlockOfferingsCommandInput,
    DescribeCapacityBlockOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeCapacityBlockOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityBlockOfferingsCommandInput,
    DescribeCapacityBlockOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCapacityBlockOfferingsCommand extends DescribeCapacityBlockOfferingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeCapacityBlockOfferingsRequest;
      output: DescribeCapacityBlockOfferingsResult;
    };
    sdk: {
      input: DescribeCapacityBlockOfferingsCommandInput;
      output: DescribeCapacityBlockOfferingsCommandOutput;
    };
  };
}
