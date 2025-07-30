import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeHostReservationOfferingsRequest,
  DescribeHostReservationOfferingsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeHostReservationOfferingsCommandInput
  extends DescribeHostReservationOfferingsRequest {}
export interface DescribeHostReservationOfferingsCommandOutput
  extends DescribeHostReservationOfferingsResult,
    __MetadataBearer {}
declare const DescribeHostReservationOfferingsCommand_base: {
  new (
    input: DescribeHostReservationOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeHostReservationOfferingsCommandInput,
    DescribeHostReservationOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeHostReservationOfferingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeHostReservationOfferingsCommandInput,
    DescribeHostReservationOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeHostReservationOfferingsCommand extends DescribeHostReservationOfferingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeHostReservationOfferingsRequest;
      output: DescribeHostReservationOfferingsResult;
    };
    sdk: {
      input: DescribeHostReservationOfferingsCommandInput;
      output: DescribeHostReservationOfferingsCommandOutput;
    };
  };
}
