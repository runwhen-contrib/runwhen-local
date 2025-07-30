import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayConnectRequest,
  CreateTransitGatewayConnectResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayConnectCommandInput
  extends CreateTransitGatewayConnectRequest {}
export interface CreateTransitGatewayConnectCommandOutput
  extends CreateTransitGatewayConnectResult,
    __MetadataBearer {}
declare const CreateTransitGatewayConnectCommand_base: {
  new (
    input: CreateTransitGatewayConnectCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayConnectCommandInput,
    CreateTransitGatewayConnectCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayConnectCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayConnectCommandInput,
    CreateTransitGatewayConnectCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayConnectCommand extends CreateTransitGatewayConnectCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayConnectRequest;
      output: CreateTransitGatewayConnectResult;
    };
    sdk: {
      input: CreateTransitGatewayConnectCommandInput;
      output: CreateTransitGatewayConnectCommandOutput;
    };
  };
}
