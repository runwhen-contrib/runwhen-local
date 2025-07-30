import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayConnectPeerRequest,
  DeleteTransitGatewayConnectPeerResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayConnectPeerCommandInput
  extends DeleteTransitGatewayConnectPeerRequest {}
export interface DeleteTransitGatewayConnectPeerCommandOutput
  extends DeleteTransitGatewayConnectPeerResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayConnectPeerCommand_base: {
  new (
    input: DeleteTransitGatewayConnectPeerCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayConnectPeerCommandInput,
    DeleteTransitGatewayConnectPeerCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayConnectPeerCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayConnectPeerCommandInput,
    DeleteTransitGatewayConnectPeerCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayConnectPeerCommand extends DeleteTransitGatewayConnectPeerCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayConnectPeerRequest;
      output: DeleteTransitGatewayConnectPeerResult;
    };
    sdk: {
      input: DeleteTransitGatewayConnectPeerCommandInput;
      output: DeleteTransitGatewayConnectPeerCommandOutput;
    };
  };
}
