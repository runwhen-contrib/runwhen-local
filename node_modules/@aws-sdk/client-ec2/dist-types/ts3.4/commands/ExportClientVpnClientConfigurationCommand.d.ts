import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ExportClientVpnClientConfigurationRequest,
  ExportClientVpnClientConfigurationResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface ExportClientVpnClientConfigurationCommandInput
  extends ExportClientVpnClientConfigurationRequest {}
export interface ExportClientVpnClientConfigurationCommandOutput
  extends ExportClientVpnClientConfigurationResult,
    __MetadataBearer {}
declare const ExportClientVpnClientConfigurationCommand_base: {
  new (
    input: ExportClientVpnClientConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportClientVpnClientConfigurationCommandInput,
    ExportClientVpnClientConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ExportClientVpnClientConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportClientVpnClientConfigurationCommandInput,
    ExportClientVpnClientConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ExportClientVpnClientConfigurationCommand extends ExportClientVpnClientConfigurationCommand_base {
  protected static __types: {
    api: {
      input: ExportClientVpnClientConfigurationRequest;
      output: ExportClientVpnClientConfigurationResult;
    };
    sdk: {
      input: ExportClientVpnClientConfigurationCommandInput;
      output: ExportClientVpnClientConfigurationCommandOutput;
    };
  };
}
