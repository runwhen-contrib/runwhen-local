import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVerifiedAccessInstanceLoggingConfigurationRequest,
  ModifyVerifiedAccessInstanceLoggingConfigurationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVerifiedAccessInstanceLoggingConfigurationCommandInput
  extends ModifyVerifiedAccessInstanceLoggingConfigurationRequest {}
export interface ModifyVerifiedAccessInstanceLoggingConfigurationCommandOutput
  extends ModifyVerifiedAccessInstanceLoggingConfigurationResult,
    __MetadataBearer {}
declare const ModifyVerifiedAccessInstanceLoggingConfigurationCommand_base: {
  new (
    input: ModifyVerifiedAccessInstanceLoggingConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessInstanceLoggingConfigurationCommandInput,
    ModifyVerifiedAccessInstanceLoggingConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVerifiedAccessInstanceLoggingConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVerifiedAccessInstanceLoggingConfigurationCommandInput,
    ModifyVerifiedAccessInstanceLoggingConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVerifiedAccessInstanceLoggingConfigurationCommand extends ModifyVerifiedAccessInstanceLoggingConfigurationCommand_base {
  protected static __types: {
    api: {
      input: ModifyVerifiedAccessInstanceLoggingConfigurationRequest;
      output: ModifyVerifiedAccessInstanceLoggingConfigurationResult;
    };
    sdk: {
      input: ModifyVerifiedAccessInstanceLoggingConfigurationCommandInput;
      output: ModifyVerifiedAccessInstanceLoggingConfigurationCommandOutput;
    };
  };
}
