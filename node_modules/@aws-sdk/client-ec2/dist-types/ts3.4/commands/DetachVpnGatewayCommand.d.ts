import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DetachVpnGatewayRequest } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DetachVpnGatewayCommandInput extends DetachVpnGatewayRequest {}
export interface DetachVpnGatewayCommandOutput extends __MetadataBearer {}
declare const DetachVpnGatewayCommand_base: {
  new (
    input: DetachVpnGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachVpnGatewayCommandInput,
    DetachVpnGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DetachVpnGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachVpnGatewayCommandInput,
    DetachVpnGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DetachVpnGatewayCommand extends DetachVpnGatewayCommand_base {
  protected static __types: {
    api: {
      input: DetachVpnGatewayRequest;
      output: {};
    };
    sdk: {
      input: DetachVpnGatewayCommandInput;
      output: DetachVpnGatewayCommandOutput;
    };
  };
}
