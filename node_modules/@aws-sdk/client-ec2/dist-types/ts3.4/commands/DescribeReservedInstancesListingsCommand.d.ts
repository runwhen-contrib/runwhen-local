import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeReservedInstancesListingsRequest,
  DescribeReservedInstancesListingsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeReservedInstancesListingsCommandInput
  extends DescribeReservedInstancesListingsRequest {}
export interface DescribeReservedInstancesListingsCommandOutput
  extends DescribeReservedInstancesListingsResult,
    __MetadataBearer {}
declare const DescribeReservedInstancesListingsCommand_base: {
  new (
    input: DescribeReservedInstancesListingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesListingsCommandInput,
    DescribeReservedInstancesListingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReservedInstancesListingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesListingsCommandInput,
    DescribeReservedInstancesListingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReservedInstancesListingsCommand extends DescribeReservedInstancesListingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeReservedInstancesListingsRequest;
      output: DescribeReservedInstancesListingsResult;
    };
    sdk: {
      input: DescribeReservedInstancesListingsCommandInput;
      output: DescribeReservedInstancesListingsCommandOutput;
    };
  };
}
