import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVerifiedAccessTrustProviderRequest,
  DeleteVerifiedAccessTrustProviderResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVerifiedAccessTrustProviderCommandInput
  extends DeleteVerifiedAccessTrustProviderRequest {}
export interface DeleteVerifiedAccessTrustProviderCommandOutput
  extends DeleteVerifiedAccessTrustProviderResult,
    __MetadataBearer {}
declare const DeleteVerifiedAccessTrustProviderCommand_base: {
  new (
    input: DeleteVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessTrustProviderCommandInput,
    DeleteVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessTrustProviderCommandInput,
    DeleteVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVerifiedAccessTrustProviderCommand extends DeleteVerifiedAccessTrustProviderCommand_base {
  protected static __types: {
    api: {
      input: DeleteVerifiedAccessTrustProviderRequest;
      output: DeleteVerifiedAccessTrustProviderResult;
    };
    sdk: {
      input: DeleteVerifiedAccessTrustProviderCommandInput;
      output: DeleteVerifiedAccessTrustProviderCommandOutput;
    };
  };
}
