import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyTransitGatewayRequest,
  ModifyTransitGatewayResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyTransitGatewayCommandInput
  extends ModifyTransitGatewayRequest {}
export interface ModifyTransitGatewayCommandOutput
  extends ModifyTransitGatewayResult,
    __MetadataBearer {}
declare const ModifyTransitGatewayCommand_base: {
  new (
    input: ModifyTransitGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTransitGatewayCommandInput,
    ModifyTransitGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTransitGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTransitGatewayCommandInput,
    ModifyTransitGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTransitGatewayCommand extends ModifyTransitGatewayCommand_base {
  protected static __types: {
    api: {
      input: ModifyTransitGatewayRequest;
      output: ModifyTransitGatewayResult;
    };
    sdk: {
      input: ModifyTransitGatewayCommandInput;
      output: ModifyTransitGatewayCommandOutput;
    };
  };
}
