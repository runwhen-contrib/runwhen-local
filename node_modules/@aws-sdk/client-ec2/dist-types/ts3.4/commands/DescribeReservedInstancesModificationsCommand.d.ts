import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeReservedInstancesModificationsRequest,
  DescribeReservedInstancesModificationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeReservedInstancesModificationsCommandInput
  extends DescribeReservedInstancesModificationsRequest {}
export interface DescribeReservedInstancesModificationsCommandOutput
  extends DescribeReservedInstancesModificationsResult,
    __MetadataBearer {}
declare const DescribeReservedInstancesModificationsCommand_base: {
  new (
    input: DescribeReservedInstancesModificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesModificationsCommandInput,
    DescribeReservedInstancesModificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReservedInstancesModificationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedInstancesModificationsCommandInput,
    DescribeReservedInstancesModificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReservedInstancesModificationsCommand extends DescribeReservedInstancesModificationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeReservedInstancesModificationsRequest;
      output: DescribeReservedInstancesModificationsResult;
    };
    sdk: {
      input: DescribeReservedInstancesModificationsCommandInput;
      output: DescribeReservedInstancesModificationsCommandOutput;
    };
  };
}
