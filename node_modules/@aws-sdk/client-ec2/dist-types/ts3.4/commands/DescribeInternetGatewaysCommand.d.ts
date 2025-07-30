import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeInternetGatewaysRequest,
  DescribeInternetGatewaysResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeInternetGatewaysCommandInput
  extends DescribeInternetGatewaysRequest {}
export interface DescribeInternetGatewaysCommandOutput
  extends DescribeInternetGatewaysResult,
    __MetadataBearer {}
declare const DescribeInternetGatewaysCommand_base: {
  new (
    input: DescribeInternetGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInternetGatewaysCommandInput,
    DescribeInternetGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeInternetGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeInternetGatewaysCommandInput,
    DescribeInternetGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeInternetGatewaysCommand extends DescribeInternetGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeInternetGatewaysRequest;
      output: DescribeInternetGatewaysResult;
    };
    sdk: {
      input: DescribeInternetGatewaysCommandInput;
      output: DescribeInternetGatewaysCommandOutput;
    };
  };
}
