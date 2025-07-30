import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpnTunnelOptionsRequest,
  ModifyVpnTunnelOptionsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpnTunnelOptionsCommandInput
  extends ModifyVpnTunnelOptionsRequest {}
export interface ModifyVpnTunnelOptionsCommandOutput
  extends ModifyVpnTunnelOptionsResult,
    __MetadataBearer {}
declare const ModifyVpnTunnelOptionsCommand_base: {
  new (
    input: ModifyVpnTunnelOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnTunnelOptionsCommandInput,
    ModifyVpnTunnelOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpnTunnelOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnTunnelOptionsCommandInput,
    ModifyVpnTunnelOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpnTunnelOptionsCommand extends ModifyVpnTunnelOptionsCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpnTunnelOptionsRequest;
      output: ModifyVpnTunnelOptionsResult;
    };
    sdk: {
      input: ModifyVpnTunnelOptionsCommandInput;
      output: ModifyVpnTunnelOptionsCommandOutput;
    };
  };
}
