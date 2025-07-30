import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessEndpointPolicyRequest,
  ModifyVerifiedAccessEndpointPolicyResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessEndpointPolicyCommandInput
  extends ModifyVerifiedAccessEndpointPolicyRequest {}
export interface ModifyVerifiedAccessEndpointPolicyCommandOutput
  extends ModifyVerifiedAccessEndpointPolicyResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessEndpointPolicyCommand_base: {
  new (
    input: ModifyVerifiedAccessEndpointPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessEndpointPolicyCommandInput,
    ModifyVerifiedAccessEndpointPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessEndpointPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessEndpointPolicyCommandInput,
    ModifyVerifiedAccessEndpointPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessEndpointPolicyCommand extends ModifyVerifiedAccessEndpointPolicyCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessEndpointPolicyRequest;
      output: ModifyVerifiedAccessEndpointPolicyResult;
    };
    sdk: {
      input: ModifyVerifiedAccessEndpointPolicyCommandInput;
      output: ModifyVerifiedAccessEndpointPolicyCommandOutput;
    };
  };
}
