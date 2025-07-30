import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointServiceConfigurationsRequest,
  DescribeVpcEndpointServiceConfigurationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointServiceConfigurationsCommandInput
  extends DescribeVpcEndpointServiceConfigurationsRequest {}
export interface DescribeVpcEndpointServiceConfigurationsCommandOutput
  extends DescribeVpcEndpointServiceConfigurationsResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointServiceConfigurationsCommand_base: {
  new (
    input: DescribeVpcEndpointServiceConfigurationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointServiceConfigurationsCommandInput,
    DescribeVpcEndpointServiceConfigurationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcEndpointServiceConfigurationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointServiceConfigurationsCommandInput,
    DescribeVpcEndpointServiceConfigurationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointServiceConfigurationsCommand extends DescribeVpcEndpointServiceConfigurationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointServiceConfigurationsRequest;
      output: DescribeVpcEndpointServiceConfigurationsResult;
    };
    sdk: {
      input: DescribeVpcEndpointServiceConfigurationsCommandInput;
      output: DescribeVpcEndpointServiceConfigurationsCommandOutput;
    };
  };
}
