import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeReservedInstancesOfferingsRequest,
  DescribeReservedInstancesOfferingsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeReservedInstancesOfferingsCommandInput
  extends DescribeReservedInstancesOfferingsRequest {}
export interface DescribeReservedInstancesOfferingsCommandOutput
  extends DescribeReservedInstancesOfferingsResult,
    __MetadataBearer {}
declare const DescribeReservedInstancesOfferingsCommand_base: {
  new (
    input: DescribeReservedInstancesOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesOfferingsCommandInput,
    DescribeReservedInstancesOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReservedInstancesOfferingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesOfferingsCommandInput,
    DescribeReservedInstancesOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReservedInstancesOfferingsCommand extends DescribeReservedInstancesOfferingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeReservedInstancesOfferingsRequest;
      output: DescribeReservedInstancesOfferingsResult;
    };
    sdk: {
      input: DescribeReservedInstancesOfferingsCommandInput;
      output: DescribeReservedInstancesOfferingsCommandOutput;
    };
  };
}
