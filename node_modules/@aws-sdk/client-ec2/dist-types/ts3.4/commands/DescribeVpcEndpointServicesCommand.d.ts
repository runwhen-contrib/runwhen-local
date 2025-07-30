import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointServicesRequest,
  DescribeVpcEndpointServicesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointServicesCommandInput
  extends DescribeVpcEndpointServicesRequest {}
export interface DescribeVpcEndpointServicesCommandOutput
  extends DescribeVpcEndpointServicesResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointServicesCommand_base: {
  new (
    input: DescribeVpcEndpointServicesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointServicesCommandInput,
    DescribeVpcEndpointServicesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVpcEndpointServicesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointServicesCommandInput,
    DescribeVpcEndpointServicesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointServicesCommand extends DescribeVpcEndpointServicesCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointServicesRequest;
      output: DescribeVpcEndpointServicesResult;
    };
    sdk: {
      input: DescribeVpcEndpointServicesCommandInput;
      output: DescribeVpcEndpointServicesCommandOutput;
    };
  };
}
