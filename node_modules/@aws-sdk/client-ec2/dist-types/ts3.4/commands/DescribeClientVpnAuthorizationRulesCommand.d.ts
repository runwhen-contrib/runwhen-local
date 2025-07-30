import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeClientVpnAuthorizationRulesRequest,
  DescribeClientVpnAuthorizationRulesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeClientVpnAuthorizationRulesCommandInput
  extends DescribeClientVpnAuthorizationRulesRequest {}
export interface DescribeClientVpnAuthorizationRulesCommandOutput
  extends DescribeClientVpnAuthorizationRulesResult,
    __MetadataBearer {}
declare const DescribeClientVpnAuthorizationRulesCommand_base: {
  new (
    input: DescribeClientVpnAuthorizationRulesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnAuthorizationRulesCommandInput,
    DescribeClientVpnAuthorizationRulesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeClientVpnAuthorizationRulesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnAuthorizationRulesCommandInput,
    DescribeClientVpnAuthorizationRulesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeClientVpnAuthorizationRulesCommand extends DescribeClientVpnAuthorizationRulesCommand_base {
  protected static __types: {
    api: {
      input: DescribeClientVpnAuthorizationRulesRequest;
      output: DescribeClientVpnAuthorizationRulesResult;
    };
    sdk: {
      input: DescribeClientVpnAuthorizationRulesCommandInput;
      output: DescribeClientVpnAuthorizationRulesCommandOutput;
    };
  };
}
