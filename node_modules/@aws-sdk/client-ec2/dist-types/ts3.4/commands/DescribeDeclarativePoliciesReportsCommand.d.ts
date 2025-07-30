import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeDeclarativePoliciesReportsRequest,
  DescribeDeclarativePoliciesReportsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeDeclarativePoliciesReportsCommandInput
  extends DescribeDeclarativePoliciesReportsRequest {}
export interface DescribeDeclarativePoliciesReportsCommandOutput
  extends DescribeDeclarativePoliciesReportsResult,
    __MetadataBearer {}
declare const DescribeDeclarativePoliciesReportsCommand_base: {
  new (
    input: DescribeDeclarativePoliciesReportsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDeclarativePoliciesReportsCommandInput,
    DescribeDeclarativePoliciesReportsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDeclarativePoliciesReportsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDeclarativePoliciesReportsCommandInput,
    DescribeDeclarativePoliciesReportsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDeclarativePoliciesReportsCommand extends DescribeDeclarativePoliciesReportsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDeclarativePoliciesReportsRequest;
      output: DescribeDeclarativePoliciesReportsResult;
    };
    sdk: {
      input: DescribeDeclarativePoliciesReportsCommandInput;
      output: DescribeDeclarativePoliciesReportsCommandOutput;
    };
  };
}
