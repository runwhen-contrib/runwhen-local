import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCapacityReservationFleetsRequest,
  DescribeCapacityReservationFleetsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCapacityReservationFleetsCommandInput
  extends DescribeCapacityReservationFleetsRequest {}
export interface DescribeCapacityReservationFleetsCommandOutput
  extends DescribeCapacityReservationFleetsResult,
    __MetadataBearer {}
declare const DescribeCapacityReservationFleetsCommand_base: {
  new (
    input: DescribeCapacityReservationFleetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityReservationFleetsCommandInput,
    DescribeCapacityReservationFleetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCapacityReservationFleetsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityReservationFleetsCommandInput,
    DescribeCapacityReservationFleetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCapacityReservationFleetsCommand extends DescribeCapacityReservationFleetsCommand_base {
  protected static __types: {
    api: {
      input: DescribeCapacityReservationFleetsRequest;
      output: DescribeCapacityReservationFleetsResult;
    };
    sdk: {
      input: DescribeCapacityReservationFleetsCommandInput;
      output: DescribeCapacityReservationFleetsCommandOutput;
    };
  };
}
