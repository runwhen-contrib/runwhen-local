import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCapacityReservationBillingRequestsRequest,
  DescribeCapacityReservationBillingRequestsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCapacityReservationBillingRequestsCommandInput
  extends DescribeCapacityReservationBillingRequestsRequest {}
export interface DescribeCapacityReservationBillingRequestsCommandOutput
  extends DescribeCapacityReservationBillingRequestsResult,
    __MetadataBearer {}
declare const DescribeCapacityReservationBillingRequestsCommand_base: {
  new (
    input: DescribeCapacityReservationBillingRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityReservationBillingRequestsCommandInput,
    DescribeCapacityReservationBillingRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeCapacityReservationBillingRequestsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityReservationBillingRequestsCommandInput,
    DescribeCapacityReservationBillingRequestsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCapacityReservationBillingRequestsCommand extends DescribeCapacityReservationBillingRequestsCommand_base {
  protected static __types: {
    api: {
      input: DescribeCapacityReservationBillingRequestsRequest;
      output: DescribeCapacityReservationBillingRequestsResult;
    };
    sdk: {
      input: DescribeCapacityReservationBillingRequestsCommandInput;
      output: DescribeCapacityReservationBillingRequestsCommandOutput;
    };
  };
}
