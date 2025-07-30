import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessTrustProviderRequest,
  ModifyVerifiedAccessTrustProviderResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessTrustProviderCommandInput
  extends ModifyVerifiedAccessTrustProviderRequest {}
export interface ModifyVerifiedAccessTrustProviderCommandOutput
  extends ModifyVerifiedAccessTrustProviderResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessTrustProviderCommand_base: {
  new (
    input: ModifyVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessTrustProviderCommandInput,
    ModifyVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessTrustProviderCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessTrustProviderCommandInput,
    ModifyVerifiedAccessTrustProviderCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessTrustProviderCommand extends ModifyVerifiedAccessTrustProviderCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessTrustProviderRequest;
      output: ModifyVerifiedAccessTrustProviderResult;
    };
    sdk: {
      input: ModifyVerifiedAccessTrustProviderCommandInput;
      output: ModifyVerifiedAccessTrustProviderCommandOutput;
    };
  };
}
