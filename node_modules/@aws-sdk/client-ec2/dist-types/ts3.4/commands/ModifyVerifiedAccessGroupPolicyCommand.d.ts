import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessGroupPolicyRequest,
  ModifyVerifiedAccessGroupPolicyResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessGroupPolicyCommandInput
  extends ModifyVerifiedAccessGroupPolicyRequest {}
export interface ModifyVerifiedAccessGroupPolicyCommandOutput
  extends ModifyVerifiedAccessGroupPolicyResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessGroupPolicyCommand_base: {
  new (
    input: ModifyVerifiedAccessGroupPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessGroupPolicyCommandInput,
    ModifyVerifiedAccessGroupPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessGroupPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessGroupPolicyCommandInput,
    ModifyVerifiedAccessGroupPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessGroupPolicyCommand extends ModifyVerifiedAccessGroupPolicyCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessGroupPolicyRequest;
      output: ModifyVerifiedAccessGroupPolicyResult;
    };
    sdk: {
      input: ModifyVerifiedAccessGroupPolicyCommandInput;
      output: ModifyVerifiedAccessGroupPolicyCommandOutput;
    };
  };
}
