import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ReplaceVpnTunnelRequest,
  ReplaceVpnTunnelResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReplaceVpnTunnelCommandInput extends ReplaceVpnTunnelRequest {}
export interface ReplaceVpnTunnelCommandOutput
  extends ReplaceVpnTunnelResult,
    __MetadataBearer {}
declare const ReplaceVpnTunnelCommand_base: {
  new (
    input: ReplaceVpnTunnelCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceVpnTunnelCommandInput,
    ReplaceVpnTunnelCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReplaceVpnTunnelCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReplaceVpnTunnelCommandInput,
    ReplaceVpnTunnelCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReplaceVpnTunnelCommand extends ReplaceVpnTunnelCommand_base {
  protected static __types: {
    api: {
      input: ReplaceVpnTunnelRequest;
      output: ReplaceVpnTunnelResult;
    };
    sdk: {
      input: ReplaceVpnTunnelCommandInput;
      output: ReplaceVpnTunnelCommandOutput;
    };
  };
}
