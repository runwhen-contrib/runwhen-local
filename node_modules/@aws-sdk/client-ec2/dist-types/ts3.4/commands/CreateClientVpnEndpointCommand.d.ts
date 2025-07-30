import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateClientVpnEndpointRequest,
  CreateClientVpnEndpointResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateClientVpnEndpointCommandInput
  extends CreateClientVpnEndpointRequest {}
export interface CreateClientVpnEndpointCommandOutput
  extends CreateClientVpnEndpointResult,
    __MetadataBearer {}
declare const CreateClientVpnEndpointCommand_base: {
  new (
    input: CreateClientVpnEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateClientVpnEndpointCommandInput,
    CreateClientVpnEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateClientVpnEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateClientVpnEndpointCommandInput,
    CreateClientVpnEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateClientVpnEndpointCommand extends CreateClientVpnEndpointCommand_base {
  protected static __types: {
    api: {
      input: CreateClientVpnEndpointRequest;
      output: CreateClientVpnEndpointResult;
    };
    sdk: {
      input: CreateClientVpnEndpointCommandInput;
      output: CreateClientVpnEndpointCommandOutput;
    };
  };
}
