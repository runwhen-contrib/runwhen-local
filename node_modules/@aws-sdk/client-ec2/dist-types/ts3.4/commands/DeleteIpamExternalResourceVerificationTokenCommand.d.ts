import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteIpamExternalResourceVerificationTokenRequest,
  DeleteIpamExternalResourceVerificationTokenResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteIpamExternalResourceVerificationTokenCommandInput
  extends DeleteIpamExternalResourceVerificationTokenRequest {}
export interface DeleteIpamExternalResourceVerificationTokenCommandOutput
  extends DeleteIpamExternalResourceVerificationTokenResult,
    __MetadataBearer {}
declare const DeleteIpamExternalResourceVerificationTokenCommand_base: {
  new (
    input: DeleteIpamExternalResourceVerificationTokenCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamExternalResourceVerificationTokenCommandInput,
    DeleteIpamExternalResourceVerificationTokenCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteIpamExternalResourceVerificationTokenCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamExternalResourceVerificationTokenCommandInput,
    DeleteIpamExternalResourceVerificationTokenCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteIpamExternalResourceVerificationTokenCommand extends DeleteIpamExternalResourceVerificationTokenCommand_base {
  protected static __types: {
    api: {
      input: DeleteIpamExternalResourceVerificationTokenRequest;
      output: DeleteIpamExternalResourceVerificationTokenResult;
    };
    sdk: {
      input: DeleteIpamExternalResourceVerificationTokenCommandInput;
      output: DeleteIpamExternalResourceVerificationTokenCommandOutput;
    };
  };
}
