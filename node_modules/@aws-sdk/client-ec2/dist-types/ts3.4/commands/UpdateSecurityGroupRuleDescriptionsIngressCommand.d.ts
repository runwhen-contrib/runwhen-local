import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  UpdateSecurityGroupRuleDescriptionsIngressRequest,
  UpdateSecurityGroupRuleDescriptionsIngressResult,
} from "../models/models_8";
export { __MetadataBearer };
export { $Command };
export interface UpdateSecurityGroupRuleDescriptionsIngressCommandInput
  extends UpdateSecurityGroupRuleDescriptionsIngressRequest {}
export interface UpdateSecurityGroupRuleDescriptionsIngressCommandOutput
  extends UpdateSecurityGroupRuleDescriptionsIngressResult,
    __MetadataBearer {}
declare const UpdateSecurityGroupRuleDescriptionsIngressCommand_base: {
  new (
    input: UpdateSecurityGroupRuleDescriptionsIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    UpdateSecurityGroupRuleDescriptionsIngressCommandInput,
    UpdateSecurityGroupRuleDescriptionsIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [UpdateSecurityGroupRuleDescriptionsIngressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    UpdateSecurityGroupRuleDescriptionsIngressCommandInput,
    UpdateSecurityGroupRuleDescriptionsIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class UpdateSecurityGroupRuleDescriptionsIngressCommand extends UpdateSecurityGroupRuleDescriptionsIngressCommand_base {
  protected static __types: {
    api: {
      input: UpdateSecurityGroupRuleDescriptionsIngressRequest;
      output: UpdateSecurityGroupRuleDescriptionsIngressResult;
    };
    sdk: {
      input: UpdateSecurityGroupRuleDescriptionsIngressCommandInput;
      output: UpdateSecurityGroupRuleDescriptionsIngressCommandOutput;
    };
  };
}
