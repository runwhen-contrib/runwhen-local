import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeLocalGatewaysRequest,
  DescribeLocalGatewaysResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeLocalGatewaysCommandInput
  extends DescribeLocalGatewaysRequest {}
export interface DescribeLocalGatewaysCommandOutput
  extends DescribeLocalGatewaysResult,
    __MetadataBearer {}
declare const DescribeLocalGatewaysCommand_base: {
  new (
    input: DescribeLocalGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewaysCommandInput,
    DescribeLocalGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeLocalGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeLocalGatewaysCommandInput,
    DescribeLocalGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeLocalGatewaysCommand extends DescribeLocalGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeLocalGatewaysRequest;
      output: DescribeLocalGatewaysResult;
    };
    sdk: {
      input: DescribeLocalGatewaysCommandInput;
      output: DescribeLocalGatewaysCommandOutput;
    };
  };
}
