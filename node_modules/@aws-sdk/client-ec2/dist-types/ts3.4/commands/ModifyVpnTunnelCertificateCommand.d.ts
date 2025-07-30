import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpnTunnelCertificateRequest,
  ModifyVpnTunnelCertificateResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpnTunnelCertificateCommandInput
  extends ModifyVpnTunnelCertificateRequest {}
export interface ModifyVpnTunnelCertificateCommandOutput
  extends ModifyVpnTunnelCertificateResult,
    __MetadataBearer {}
declare const ModifyVpnTunnelCertificateCommand_base: {
  new (
    input: ModifyVpnTunnelCertificateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnTunnelCertificateCommandInput,
    ModifyVpnTunnelCertificateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpnTunnelCertificateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnTunnelCertificateCommandInput,
    ModifyVpnTunnelCertificateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpnTunnelCertificateCommand extends ModifyVpnTunnelCertificateCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpnTunnelCertificateRequest;
      output: ModifyVpnTunnelCertificateResult;
    };
    sdk: {
      input: ModifyVpnTunnelCertificateCommandInput;
      output: ModifyVpnTunnelCertificateCommandOutput;
    };
  };
}
