import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateClientVpnRouteRequest,
  CreateClientVpnRouteResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateClientVpnRouteCommandInput
  extends CreateClientVpnRouteRequest {}
export interface CreateClientVpnRouteCommandOutput
  extends CreateClientVpnRouteResult,
    __MetadataBearer {}
declare const CreateClientVpnRouteCommand_base: {
  new (
    input: CreateClientVpnRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateClientVpnRouteCommandInput,
    CreateClientVpnRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateClientVpnRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateClientVpnRouteCommandInput,
    CreateClientVpnRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateClientVpnRouteCommand extends CreateClientVpnRouteCommand_base {
  protected static __types: {
    api: {
      input: CreateClientVpnRouteRequest;
      output: CreateClientVpnRouteResult;
    };
    sdk: {
      input: CreateClientVpnRouteCommandInput;
      output: CreateClientVpnRouteCommandOutput;
    };
  };
}
