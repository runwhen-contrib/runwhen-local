import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpnConnectionRequest,
  ModifyVpnConnectionResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpnConnectionCommandInput
  extends ModifyVpnConnectionRequest {}
export interface ModifyVpnConnectionCommandOutput
  extends ModifyVpnConnectionResult,
    __MetadataBearer {}
declare const ModifyVpnConnectionCommand_base: {
  new (
    input: ModifyVpnConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnConnectionCommandInput,
    ModifyVpnConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpnConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnConnectionCommandInput,
    ModifyVpnConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpnConnectionCommand extends ModifyVpnConnectionCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpnConnectionRequest;
      output: ModifyVpnConnectionResult;
    };
    sdk: {
      input: ModifyVpnConnectionCommandInput;
      output: ModifyVpnConnectionCommandOutput;
    };
  };
}
