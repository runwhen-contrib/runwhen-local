import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInstanceCreditSpecificationsRequest,
  DescribeInstanceCreditSpecificationsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInstanceCreditSpecificationsCommandInput
  extends DescribeInstanceCreditSpecificationsRequest {}
export interface DescribeInstanceCreditSpecificationsCommandOutput
  extends DescribeInstanceCreditSpecificationsResult,
    __MetadataBearer {}
declare const DescribeInstanceCreditSpecificationsCommand_base: {
  new (
    input: DescribeInstanceCreditSpecificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceCreditSpecificationsCommandInput,
    DescribeInstanceCreditSpecificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInstanceCreditSpecificationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInstanceCreditSpecificationsCommandInput,
    DescribeInstanceCreditSpecificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInstanceCreditSpecificationsCommand extends DescribeInstanceCreditSpecificationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeInstanceCreditSpecificationsRequest;
      output: DescribeInstanceCreditSpecificationsResult;
    };
    sdk: {
      input: DescribeInstanceCreditSpecificationsCommandInput;
      output: DescribeInstanceCreditSpecificationsCommandOutput;
    };
  };
}
