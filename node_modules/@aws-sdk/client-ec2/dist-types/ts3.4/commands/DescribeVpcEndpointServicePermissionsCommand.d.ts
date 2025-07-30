import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVpcEndpointServicePermissionsRequest,
  DescribeVpcEndpointServicePermissionsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVpcEndpointServicePermissionsCommandInput
  extends DescribeVpcEndpointServicePermissionsRequest {}
export interface DescribeVpcEndpointServicePermissionsCommandOutput
  extends DescribeVpcEndpointServicePermissionsResult,
    __MetadataBearer {}
declare const DescribeVpcEndpointServicePermissionsCommand_base: {
  new (
    input: DescribeVpcEndpointServicePermissionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointServicePermissionsCommandInput,
    DescribeVpcEndpointServicePermissionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeVpcEndpointServicePermissionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVpcEndpointServicePermissionsCommandInput,
    DescribeVpcEndpointServicePermissionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVpcEndpointServicePermissionsCommand extends DescribeVpcEndpointServicePermissionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVpcEndpointServicePermissionsRequest;
      output: DescribeVpcEndpointServicePermissionsResult;
    };
    sdk: {
      input: DescribeVpcEndpointServicePermissionsCommandInput;
      output: DescribeVpcEndpointServicePermissionsCommandOutput;
    };
  };
}
