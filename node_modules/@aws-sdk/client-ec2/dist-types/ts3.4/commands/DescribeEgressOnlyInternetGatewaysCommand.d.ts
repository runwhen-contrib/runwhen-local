import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeEgressOnlyInternetGatewaysRequest,
  DescribeEgressOnlyInternetGatewaysResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeEgressOnlyInternetGatewaysCommandInput
  extends DescribeEgressOnlyInternetGatewaysRequest {}
export interface DescribeEgressOnlyInternetGatewaysCommandOutput
  extends DescribeEgressOnlyInternetGatewaysResult,
    __MetadataBearer {}
declare const DescribeEgressOnlyInternetGatewaysCommand_base: {
  new (
    input: DescribeEgressOnlyInternetGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEgressOnlyInternetGatewaysCommandInput,
    DescribeEgressOnlyInternetGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeEgressOnlyInternetGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEgressOnlyInternetGatewaysCommandInput,
    DescribeEgressOnlyInternetGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeEgressOnlyInternetGatewaysCommand extends DescribeEgressOnlyInternetGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeEgressOnlyInternetGatewaysRequest;
      output: DescribeEgressOnlyInternetGatewaysResult;
    };
    sdk: {
      input: DescribeEgressOnlyInternetGatewaysCommandInput;
      output: DescribeEgressOnlyInternetGatewaysCommandOutput;
    };
  };
}
