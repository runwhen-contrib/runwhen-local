import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCarrierGatewaysRequest,
  DescribeCarrierGatewaysResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCarrierGatewaysCommandInput
  extends DescribeCarrierGatewaysRequest {}
export interface DescribeCarrierGatewaysCommandOutput
  extends DescribeCarrierGatewaysResult,
    __MetadataBearer {}
declare const DescribeCarrierGatewaysCommand_base: {
  new (
    input: DescribeCarrierGatewaysCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCarrierGatewaysCommandInput,
    DescribeCarrierGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCarrierGatewaysCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCarrierGatewaysCommandInput,
    DescribeCarrierGatewaysCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCarrierGatewaysCommand extends DescribeCarrierGatewaysCommand_base {
  protected static __types: {
    api: {
      input: DescribeCarrierGatewaysRequest;
      output: DescribeCarrierGatewaysResult;
    };
    sdk: {
      input: DescribeCarrierGatewaysCommandInput;
      output: DescribeCarrierGatewaysCommandOutput;
    };
  };
}
