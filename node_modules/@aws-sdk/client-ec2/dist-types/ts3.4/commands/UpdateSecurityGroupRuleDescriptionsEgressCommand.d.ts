import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  UpdateSecurityGroupRuleDescriptionsEgressRequest,
  UpdateSecurityGroupRuleDescriptionsEgressResult,
} from "../models/models_8";
export { __MetadataBearer };
export { $Command };
export interface UpdateSecurityGroupRuleDescriptionsEgressCommandInput
  extends UpdateSecurityGroupRuleDescriptionsEgressRequest {}
export interface UpdateSecurityGroupRuleDescriptionsEgressCommandOutput
  extends UpdateSecurityGroupRuleDescriptionsEgressResult,
    __MetadataBearer {}
declare const UpdateSecurityGroupRuleDescriptionsEgressCommand_base: {
  new (
    input: UpdateSecurityGroupRuleDescriptionsEgressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    UpdateSecurityGroupRuleDescriptionsEgressCommandInput,
    UpdateSecurityGroupRuleDescriptionsEgressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [UpdateSecurityGroupRuleDescriptionsEgressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    UpdateSecurityGroupRuleDescriptionsEgressCommandInput,
    UpdateSecurityGroupRuleDescriptionsEgressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class UpdateSecurityGroupRuleDescriptionsEgressCommand extends UpdateSecurityGroupRuleDescriptionsEgressCommand_base {
  protected static __types: {
    api: {
      input: UpdateSecurityGroupRuleDescriptionsEgressRequest;
      output: UpdateSecurityGroupRuleDescriptionsEgressResult;
    };
    sdk: {
      input: UpdateSecurityGroupRuleDescriptionsEgressCommandInput;
      output: UpdateSecurityGroupRuleDescriptionsEgressCommandOutput;
    };
  };
}
