import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetVpnTunnelReplacementStatusRequest,
  GetVpnTunnelReplacementStatusResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetVpnTunnelReplacementStatusCommandInput
  extends GetVpnTunnelReplacementStatusRequest {}
export interface GetVpnTunnelReplacementStatusCommandOutput
  extends GetVpnTunnelReplacementStatusResult,
    __MetadataBearer {}
declare const GetVpnTunnelReplacementStatusCommand_base: {
  new (
    input: GetVpnTunnelReplacementStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVpnTunnelReplacementStatusCommandInput,
    GetVpnTunnelReplacementStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetVpnTunnelReplacementStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVpnTunnelReplacementStatusCommandInput,
    GetVpnTunnelReplacementStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetVpnTunnelReplacementStatusCommand extends GetVpnTunnelReplacementStatusCommand_base {
  protected static __types: {
    api: {
      input: GetVpnTunnelReplacementStatusRequest;
      output: GetVpnTunnelReplacementStatusResult;
    };
    sdk: {
      input: GetVpnTunnelReplacementStatusCommandInput;
      output: GetVpnTunnelReplacementStatusCommandOutput;
    };
  };
}
