import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeAvailabilityZonesRequest,
  DescribeAvailabilityZonesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeAvailabilityZonesCommandInput
  extends DescribeAvailabilityZonesRequest {}
export interface DescribeAvailabilityZonesCommandOutput
  extends DescribeAvailabilityZonesResult,
    __MetadataBearer {}
declare const DescribeAvailabilityZonesCommand_base: {
  new (
    input: DescribeAvailabilityZonesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAvailabilityZonesCommandInput,
    DescribeAvailabilityZonesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAvailabilityZonesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAvailabilityZonesCommandInput,
    DescribeAvailabilityZonesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAvailabilityZonesCommand extends DescribeAvailabilityZonesCommand_base {
  protected static __types: {
    api: {
      input: DescribeAvailabilityZonesRequest;
      output: DescribeAvailabilityZonesResult;
    };
    sdk: {
      input: DescribeAvailabilityZonesCommandInput;
      output: DescribeAvailabilityZonesCommandOutput;
    };
  };
}
