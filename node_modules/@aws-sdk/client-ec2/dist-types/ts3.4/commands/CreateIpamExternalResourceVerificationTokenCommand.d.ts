import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateIpamExternalResourceVerificationTokenRequest,
  CreateIpamExternalResourceVerificationTokenResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateIpamExternalResourceVerificationTokenCommandInput
  extends CreateIpamExternalResourceVerificationTokenRequest {}
export interface CreateIpamExternalResourceVerificationTokenCommandOutput
  extends CreateIpamExternalResourceVerificationTokenResult,
    __MetadataBearer {}
declare const CreateIpamExternalResourceVerificationTokenCommand_base: {
  new (
    input: CreateIpamExternalResourceVerificationTokenCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamExternalResourceVerificationTokenCommandInput,
    CreateIpamExternalResourceVerificationTokenCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateIpamExternalResourceVerificationTokenCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamExternalResourceVerificationTokenCommandInput,
    CreateIpamExternalResourceVerificationTokenCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateIpamExternalResourceVerificationTokenCommand extends CreateIpamExternalResourceVerificationTokenCommand_base {
  protected static __types: {
    api: {
      input: CreateIpamExternalResourceVerificationTokenRequest;
      output: CreateIpamExternalResourceVerificationTokenResult;
    };
    sdk: {
      input: CreateIpamExternalResourceVerificationTokenCommandInput;
      output: CreateIpamExternalResourceVerificationTokenCommandOutput;
    };
  };
}
