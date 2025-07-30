import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AttachVerifiedAccessTrustProviderRequest,
  AttachVerifiedAccessTrustProviderResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AttachVerifiedAccessTrustProviderCommandInput
  extends AttachVerifiedAccessTrustProviderRequest {}
export interface AttachVerifiedAccessTrustProviderCommandOutput
  extends AttachVerifiedAccessTrustProviderResult,
    __MetadataBearer {}
declare const AttachVerifiedAccessTrustProviderCommand_base: {
  new (
    input: AttachVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachVerifiedAccessTrustProviderCommandInput,
    AttachVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AttachVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachVerifiedAccessTrustProviderCommandInput,
    AttachVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AttachVerifiedAccessTrustProviderCommand extends AttachVerifiedAccessTrustProviderCommand_base {
  protected static __types: {
    api: {
      input: AttachVerifiedAccessTrustProviderRequest;
      output: AttachVerifiedAccessTrustProviderResult;
    };
    sdk: {
      input: AttachVerifiedAccessTrustProviderCommandInput;
      output: AttachVerifiedAccessTrustProviderCommandOutput;
    };
  };
}
