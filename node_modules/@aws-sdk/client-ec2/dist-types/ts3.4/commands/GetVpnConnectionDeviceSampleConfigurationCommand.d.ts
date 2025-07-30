import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetVpnConnectionDeviceSampleConfigurationRequest,
  GetVpnConnectionDeviceSampleConfigurationResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetVpnConnectionDeviceSampleConfigurationCommandInput
  extends GetVpnConnectionDeviceSampleConfigurationRequest {}
export interface GetVpnConnectionDeviceSampleConfigurationCommandOutput
  extends GetVpnConnectionDeviceSampleConfigurationResult,
    __MetadataBearer {}
declare const GetVpnConnectionDeviceSampleConfigurationCommand_base: {
  new (
    input: GetVpnConnectionDeviceSampleConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVpnConnectionDeviceSampleConfigurationCommandInput,
    GetVpnConnectionDeviceSampleConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetVpnConnectionDeviceSampleConfigurationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVpnConnectionDeviceSampleConfigurationCommandInput,
    GetVpnConnectionDeviceSampleConfigurationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetVpnConnectionDeviceSampleConfigurationCommand extends GetVpnConnectionDeviceSampleConfigurationCommand_base {
  protected static __types: {
    api: {
      input: GetVpnConnectionDeviceSampleConfigurationRequest;
      output: GetVpnConnectionDeviceSampleConfigurationResult;
    };
    sdk: {
      input: GetVpnConnectionDeviceSampleConfigurationCommandInput;
      output: GetVpnConnectionDeviceSampleConfigurationCommandOutput;
    };
  };
}
