import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeNatGatewaysRequest,
  DescribeNatGatewaysResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeNatGatewaysCommandInput
  extends DescribeNatGatewaysRequest {}
export interface DescribeNatGatewaysCommandOutput
  extends DescribeNatGatewaysResult,
    __MetadataBearer {}
declare const DescribeNatGatewaysCommand_base: {
  new (
    input: DescribeNatGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNatGatewaysCommandInput,
    DescribeNatGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeNatGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeNatGatewaysCommandInput,
    DescribeNatGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeNatGatewaysCommand extends DescribeNatGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeNatGatewaysRequest;
      output: DescribeNatGatewaysResult;
    };
    sdk: {
      input: DescribeNatGatewaysCommandInput;
      output: DescribeNatGatewaysCommandOutput;
    };
  };
}
