import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeHostReservationsRequest,
  DescribeHostReservationsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeHostReservationsCommandInput
  extends DescribeHostReservationsRequest {}
export interface DescribeHostReservationsCommandOutput
  extends DescribeHostReservationsResult,
    __MetadataBearer {}
declare const DescribeHostReservationsCommand_base: {
  new (
    input: DescribeHostReservationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeHostReservationsCommandInput,
    DescribeHostReservationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeHostReservationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeHostReservationsCommandInput,
    DescribeHostReservationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeHostReservationsCommand extends DescribeHostReservationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeHostReservationsRequest;
      output: DescribeHostReservationsResult;
    };
    sdk: {
      input: DescribeHostReservationsCommandInput;
      output: DescribeHostReservationsCommandOutput;
    };
  };
}
