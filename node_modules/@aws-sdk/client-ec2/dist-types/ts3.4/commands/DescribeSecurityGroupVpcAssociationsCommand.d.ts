import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSecurityGroupVpcAssociationsRequest,
  DescribeSecurityGroupVpcAssociationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSecurityGroupVpcAssociationsCommandInput
  extends DescribeSecurityGroupVpcAssociationsRequest {}
export interface DescribeSecurityGroupVpcAssociationsCommandOutput
  extends DescribeSecurityGroupVpcAssociationsResult,
    __MetadataBearer {}
declare const DescribeSecurityGroupVpcAssociationsCommand_base: {
  new (
    input: DescribeSecurityGroupVpcAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupVpcAssociationsCommandInput,
    DescribeSecurityGroupVpcAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSecurityGroupVpcAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupVpcAssociationsCommandInput,
    DescribeSecurityGroupVpcAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSecurityGroupVpcAssociationsCommand extends DescribeSecurityGroupVpcAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSecurityGroupVpcAssociationsRequest;
      output: DescribeSecurityGroupVpcAssociationsResult;
    };
    sdk: {
      input: DescribeSecurityGroupVpcAssociationsCommandInput;
      output: DescribeSecurityGroupVpcAssociationsCommandOutput;
    };
  };
}
