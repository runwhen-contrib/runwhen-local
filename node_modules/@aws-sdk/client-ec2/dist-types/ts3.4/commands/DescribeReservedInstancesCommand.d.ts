import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeReservedInstancesRequest,
  DescribeReservedInstancesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeReservedInstancesCommandInput
  extends DescribeReservedInstancesRequest {}
export interface DescribeReservedInstancesCommandOutput
  extends DescribeReservedInstancesResult,
    __MetadataBearer {}
declare const DescribeReservedInstancesCommand_base: {
  new (
    input: DescribeReservedInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesCommandInput,
    DescribeReservedInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReservedInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesCommandInput,
    DescribeReservedInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReservedInstancesCommand extends DescribeReservedInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeReservedInstancesRequest;
      output: DescribeReservedInstancesResult;
    };
    sdk: {
      input: DescribeReservedInstancesCommandInput;
      output: DescribeReservedInstancesCommandOutput;
    };
  };
}
