import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCustomerGatewaysRequest,
  DescribeCustomerGatewaysResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeCustomerGatewaysCommandInput
  extends DescribeCustomerGatewaysRequest {}
export interface DescribeCustomerGatewaysCommandOutput
  extends DescribeCustomerGatewaysResult,
    __MetadataBearer {}
declare const DescribeCustomerGatewaysCommand_base: {
  new (
    input: DescribeCustomerGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCustomerGatewaysCommandInput,
    DescribeCustomerGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCustomerGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCustomerGatewaysCommandInput,
    DescribeCustomerGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCustomerGatewaysCommand extends DescribeCustomerGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeCustomerGatewaysRequest;
      output: DescribeCustomerGatewaysResult;
    };
    sdk: {
      input: DescribeCustomerGatewaysCommandInput;
      output: DescribeCustomerGatewaysCommandOutput;
    };
  };
}
