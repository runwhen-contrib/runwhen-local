import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteVpnConnectionRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpnConnectionCommandInput
  extends DeleteVpnConnectionRequest {}
export interface DeleteVpnConnectionCommandOutput extends __MetadataBearer {}
declare const DeleteVpnConnectionCommand_base: {
  new (
    input: DeleteVpnConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpnConnectionCommandInput,
    DeleteVpnConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpnConnectionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpnConnectionCommandInput,
    DeleteVpnConnectionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpnConnectionCommand extends DeleteVpnConnectionCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpnConnectionRequest;
      output: {};
    };
    sdk: {
      input: DeleteVpnConnectionCommandInput;
      output: DeleteVpnConnectionCommandOutput;
    };
  };
}
