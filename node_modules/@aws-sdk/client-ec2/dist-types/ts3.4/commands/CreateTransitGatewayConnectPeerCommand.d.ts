import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayConnectPeerRequest,
  CreateTransitGatewayConnectPeerResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayConnectPeerCommandInput
  extends CreateTransitGatewayConnectPeerRequest {}
export interface CreateTransitGatewayConnectPeerCommandOutput
  extends CreateTransitGatewayConnectPeerResult,
    __MetadataBearer {}
declare const CreateTransitGatewayConnectPeerCommand_base: {
  new (
    input: CreateTransitGatewayConnectPeerCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayConnectPeerCommandInput,
    CreateTransitGatewayConnectPeerCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayConnectPeerCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayConnectPeerCommandInput,
    CreateTransitGatewayConnectPeerCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayConnectPeerCommand extends CreateTransitGatewayConnectPeerCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayConnectPeerRequest;
      output: CreateTransitGatewayConnectPeerResult;
    };
    sdk: {
      input: CreateTransitGatewayConnectPeerCommandInput;
      output: CreateTransitGatewayConnectPeerCommandOutput;
    };
  };
}
