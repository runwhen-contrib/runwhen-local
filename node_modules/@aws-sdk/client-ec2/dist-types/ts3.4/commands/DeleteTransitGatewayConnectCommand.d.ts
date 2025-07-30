import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayConnectRequest,
  DeleteTransitGatewayConnectResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayConnectCommandInput
  extends DeleteTransitGatewayConnectRequest {}
export interface DeleteTransitGatewayConnectCommandOutput
  extends DeleteTransitGatewayConnectResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayConnectCommand_base: {
  new (
    input: DeleteTransitGatewayConnectCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayConnectCommandInput,
    DeleteTransitGatewayConnectCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayConnectCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayConnectCommandInput,
    DeleteTransitGatewayConnectCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayConnectCommand extends DeleteTransitGatewayConnectCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayConnectRequest;
      output: DeleteTransitGatewayConnectResult;
    };
    sdk: {
      input: DeleteTransitGatewayConnectCommandInput;
      output: DeleteTransitGatewayConnectCommandOutput;
    };
  };
}
