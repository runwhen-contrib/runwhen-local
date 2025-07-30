import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSecurityGroupRulesRequest,
  DescribeSecurityGroupRulesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSecurityGroupRulesCommandInput
  extends DescribeSecurityGroupRulesRequest {}
export interface DescribeSecurityGroupRulesCommandOutput
  extends DescribeSecurityGroupRulesResult,
    __MetadataBearer {}
declare const DescribeSecurityGroupRulesCommand_base: {
  new (
    input: DescribeSecurityGroupRulesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupRulesCommandInput,
    DescribeSecurityGroupRulesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSecurityGroupRulesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupRulesCommandInput,
    DescribeSecurityGroupRulesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSecurityGroupRulesCommand extends DescribeSecurityGroupRulesCommand_base {
  protected static __types: {
    api: {
      input: DescribeSecurityGroupRulesRequest;
      output: DescribeSecurityGroupRulesResult;
    };
    sdk: {
      input: DescribeSecurityGroupRulesCommandInput;
      output: DescribeSecurityGroupRulesCommandOutput;
    };
  };
}
