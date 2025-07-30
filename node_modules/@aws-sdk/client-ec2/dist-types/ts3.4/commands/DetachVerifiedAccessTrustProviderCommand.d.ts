import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DetachVerifiedAccessTrustProviderRequest,
  DetachVerifiedAccessTrustProviderResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DetachVerifiedAccessTrustProviderCommandInput
  extends DetachVerifiedAccessTrustProviderRequest {}
export interface DetachVerifiedAccessTrustProviderCommandOutput
  extends DetachVerifiedAccessTrustProviderResult,
    __MetadataBearer {}
declare const DetachVerifiedAccessTrustProviderCommand_base: {
  new (
    input: DetachVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachVerifiedAccessTrustProviderCommandInput,
    DetachVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DetachVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachVerifiedAccessTrustProviderCommandInput,
    DetachVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DetachVerifiedAccessTrustProviderCommand extends DetachVerifiedAccessTrustProviderCommand_base {
  protected static __types: {
    api: {
      input: DetachVerifiedAccessTrustProviderRequest;
      output: DetachVerifiedAccessTrustProviderResult;
    };
    sdk: {
      input: DetachVerifiedAccessTrustProviderCommandInput;
      output: DetachVerifiedAccessTrustProviderCommandOutput;
    };
  };
}
