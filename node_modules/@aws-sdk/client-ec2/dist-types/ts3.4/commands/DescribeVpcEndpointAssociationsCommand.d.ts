import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointAssociationsRequest,
  DescribeVpcEndpointAssociationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointAssociationsCommandInput
  extends DescribeVpcEndpointAssociationsRequest {}
export interface DescribeVpcEndpointAssociationsCommandOutput
  extends DescribeVpcEndpointAssociationsResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointAssociationsCommand_base: {
  new (
    input: DescribeVpcEndpointAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointAssociationsCommandInput,
    DescribeVpcEndpointAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcEndpointAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointAssociationsCommandInput,
    DescribeVpcEndpointAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointAssociationsCommand extends DescribeVpcEndpointAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointAssociationsRequest;
      output: DescribeVpcEndpointAssociationsResult;
    };
    sdk: {
      input: DescribeVpcEndpointAssociationsCommandInput;
      output: DescribeVpcEndpointAssociationsCommandOutput;
    };
  };
}
