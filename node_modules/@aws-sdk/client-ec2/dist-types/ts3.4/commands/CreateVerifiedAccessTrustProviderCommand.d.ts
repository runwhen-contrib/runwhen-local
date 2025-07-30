import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVerifiedAccessTrustProviderRequest,
  CreateVerifiedAccessTrustProviderResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVerifiedAccessTrustProviderCommandInput
  extends CreateVerifiedAccessTrustProviderRequest {}
export interface CreateVerifiedAccessTrustProviderCommandOutput
  extends CreateVerifiedAccessTrustProviderResult,
    __MetadataBearer {}
declare const CreateVerifiedAccessTrustProviderCommand_base: {
  new (
    input: CreateVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessTrustProviderCommandInput,
    CreateVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVerifiedAccessTrustProviderCommandInput,
    CreateVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVerifiedAccessTrustProviderCommand extends CreateVerifiedAccessTrustProviderCommand_base {
  protected static __types: {
    api: {
      input: CreateVerifiedAccessTrustProviderRequest;
      output: CreateVerifiedAccessTrustProviderResult;
    };
    sdk: {
      input: CreateVerifiedAccessTrustProviderCommandInput;
      output: CreateVerifiedAccessTrustProviderCommandOutput;
    };
  };
}
