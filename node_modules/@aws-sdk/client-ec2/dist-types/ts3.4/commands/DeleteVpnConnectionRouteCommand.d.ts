import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteVpnConnectionRouteRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpnConnectionRouteCommandInput
  extends DeleteVpnConnectionRouteRequest {}
export interface DeleteVpnConnectionRouteCommandOutput
  extends __MetadataBearer {}
declare const DeleteVpnConnectionRouteCommand_base: {
  new (
    input: DeleteVpnConnectionRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpnConnectionRouteCommandInput,
    DeleteVpnConnectionRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpnConnectionRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpnConnectionRouteCommandInput,
    DeleteVpnConnectionRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpnConnectionRouteCommand extends DeleteVpnConnectionRouteCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpnConnectionRouteRequest;
      output: {};
    };
    sdk: {
      input: DeleteVpnConnectionRouteCommandInput;
      output: DeleteVpnConnectionRouteCommandOutput;
    };
  };
}
