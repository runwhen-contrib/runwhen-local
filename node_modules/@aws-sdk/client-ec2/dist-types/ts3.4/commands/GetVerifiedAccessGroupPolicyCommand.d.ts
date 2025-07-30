import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetVerifiedAccessGroupPolicyRequest,
  GetVerifiedAccessGroupPolicyResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetVerifiedAccessGroupPolicyCommandInput
  extends GetVerifiedAccessGroupPolicyRequest {}
export interface GetVerifiedAccessGroupPolicyCommandOutput
  extends GetVerifiedAccessGroupPolicyResult,
    __MetadataBearer {}
declare const GetVerifiedAccessGroupPolicyCommand_base: {
  new (
    input: GetVerifiedAccessGroupPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVerifiedAccessGroupPolicyCommandInput,
    GetVerifiedAccessGroupPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetVerifiedAccessGroupPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVerifiedAccessGroupPolicyCommandInput,
    GetVerifiedAccessGroupPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetVerifiedAccessGroupPolicyCommand extends GetVerifiedAccessGroupPolicyCommand_base {
  protected static __types: {
    api: {
      input: GetVerifiedAccessGroupPolicyRequest;
      output: GetVerifiedAccessGroupPolicyResult;
    };
    sdk: {
      input: GetVerifiedAccessGroupPolicyCommandInput;
      output: GetVerifiedAccessGroupPolicyCommandOutput;
    };
  };
}
