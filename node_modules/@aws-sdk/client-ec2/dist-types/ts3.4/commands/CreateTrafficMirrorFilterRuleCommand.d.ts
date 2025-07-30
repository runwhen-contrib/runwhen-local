import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTrafficMirrorFilterRuleRequest,
  CreateTrafficMirrorFilterRuleResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTrafficMirrorFilterRuleCommandInput
  extends CreateTrafficMirrorFilterRuleRequest {}
export interface CreateTrafficMirrorFilterRuleCommandOutput
  extends CreateTrafficMirrorFilterRuleResult,
    __MetadataBearer {}
declare const CreateTrafficMirrorFilterRuleCommand_base: {
  new (
    input: CreateTrafficMirrorFilterRuleCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorFilterRuleCommandInput,
    CreateTrafficMirrorFilterRuleCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTrafficMirrorFilterRuleCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTrafficMirrorFilterRuleCommandInput,
    CreateTrafficMirrorFilterRuleCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTrafficMirrorFilterRuleCommand extends CreateTrafficMirrorFilterRuleCommand_base {
  protected static __types: {
    api: {
      input: CreateTrafficMirrorFilterRuleRequest;
      output: CreateTrafficMirrorFilterRuleResult;
    };
    sdk: {
      input: CreateTrafficMirrorFilterRuleCommandInput;
      output: CreateTrafficMirrorFilterRuleCommandOutput;
    };
  };
}
