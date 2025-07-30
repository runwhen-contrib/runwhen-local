import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCapacityReservationsRequest,
  DescribeCapacityReservationsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCapacityReservationsCommandInput
  extends DescribeCapacityReservationsRequest {}
export interface DescribeCapacityReservationsCommandOutput
  extends DescribeCapacityReservationsResult,
    __MetadataBearer {}
declare const DescribeCapacityReservationsCommand_base: {
  new (
    input: DescribeCapacityReservationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityReservationsCommandInput,
    DescribeCapacityReservationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCapacityReservationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityReservationsCommandInput,
    DescribeCapacityReservationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCapacityReservationsCommand extends DescribeCapacityReservationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeCapacityReservationsRequest;
      output: DescribeCapacityReservationsResult;
    };
    sdk: {
      input: DescribeCapacityReservationsCommandInput;
      output: DescribeCapacityReservationsCommandOutput;
    };
  };
}
