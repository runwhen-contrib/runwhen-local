import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyTrafficMirrorFilterRuleRequest,
  ModifyTrafficMirrorFilterRuleResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyTrafficMirrorFilterRuleCommandInput
  extends ModifyTrafficMirrorFilterRuleRequest {}
export interface ModifyTrafficMirrorFilterRuleCommandOutput
  extends ModifyTrafficMirrorFilterRuleResult,
    __MetadataBearer {}
declare const ModifyTrafficMirrorFilterRuleCommand_base: {
  new (
    input: ModifyTrafficMirrorFilterRuleCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTrafficMirrorFilterRuleCommandInput,
    ModifyTrafficMirrorFilterRuleCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTrafficMirrorFilterRuleCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTrafficMirrorFilterRuleCommandInput,
    ModifyTrafficMirrorFilterRuleCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTrafficMirrorFilterRuleCommand extends ModifyTrafficMirrorFilterRuleCommand_base {
  protected static __types: {
    api: {
      input: ModifyTrafficMirrorFilterRuleRequest;
      output: ModifyTrafficMirrorFilterRuleResult;
    };
    sdk: {
      input: ModifyTrafficMirrorFilterRuleCommandInput;
      output: ModifyTrafficMirrorFilterRuleCommandOutput;
    };
  };
}
