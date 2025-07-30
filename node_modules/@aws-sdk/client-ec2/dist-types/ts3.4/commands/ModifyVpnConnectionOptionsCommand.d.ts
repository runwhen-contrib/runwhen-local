import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpnConnectionOptionsRequest,
  ModifyVpnConnectionOptionsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpnConnectionOptionsCommandInput
  extends ModifyVpnConnectionOptionsRequest {}
export interface ModifyVpnConnectionOptionsCommandOutput
  extends ModifyVpnConnectionOptionsResult,
    __MetadataBearer {}
declare const ModifyVpnConnectionOptionsCommand_base: {
  new (
    input: ModifyVpnConnectionOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnConnectionOptionsCommandInput,
    ModifyVpnConnectionOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpnConnectionOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpnConnectionOptionsCommandInput,
    ModifyVpnConnectionOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpnConnectionOptionsCommand extends ModifyVpnConnectionOptionsCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpnConnectionOptionsRequest;
      output: ModifyVpnConnectionOptionsResult;
    };
    sdk: {
      input: ModifyVpnConnectionOptionsCommandInput;
      output: ModifyVpnConnectionOptionsCommandOutput;
    };
  };
}
