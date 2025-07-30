import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetVerifiedAccessEndpointPolicyRequest,
  GetVerifiedAccessEndpointPolicyResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetVerifiedAccessEndpointPolicyCommandInput
  extends GetVerifiedAccessEndpointPolicyRequest {}
export interface GetVerifiedAccessEndpointPolicyCommandOutput
  extends GetVerifiedAccessEndpointPolicyResult,
    __MetadataBearer {}
declare const GetVerifiedAccessEndpointPolicyCommand_base: {
  new (
    input: GetVerifiedAccessEndpointPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVerifiedAccessEndpointPolicyCommandInput,
    GetVerifiedAccessEndpointPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetVerifiedAccessEndpointPolicyCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVerifiedAccessEndpointPolicyCommandInput,
    GetVerifiedAccessEndpointPolicyCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetVerifiedAccessEndpointPolicyCommand extends GetVerifiedAccessEndpointPolicyCommand_base {
  protected static __types: {
    api: {
      input: GetVerifiedAccessEndpointPolicyRequest;
      output: GetVerifiedAccessEndpointPolicyResult;
    };
    sdk: {
      input: GetVerifiedAccessEndpointPolicyCommandInput;
      output: GetVerifiedAccessEndpointPolicyCommandOutput;
    };
  };
}
