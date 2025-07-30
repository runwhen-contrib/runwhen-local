import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AttachVpnGatewayRequest,
  AttachVpnGatewayResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AttachVpnGatewayCommandInput extends AttachVpnGatewayRequest {}
export interface AttachVpnGatewayCommandOutput
  extends AttachVpnGatewayResult,
    __MetadataBearer {}
declare const AttachVpnGatewayCommand_base: {
  new (
    input: AttachVpnGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachVpnGatewayCommandInput,
    AttachVpnGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AttachVpnGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachVpnGatewayCommandInput,
    AttachVpnGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AttachVpnGatewayCommand extends AttachVpnGatewayCommand_base {
  protected static __types: {
    api: {
      input: AttachVpnGatewayRequest;
      output: AttachVpnGatewayResult;
    };
    sdk: {
      input: AttachVpnGatewayCommandInput;
      output: AttachVpnGatewayCommandOutput;
    };
  };
}
