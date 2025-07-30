import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayRequest,
  DeleteTransitGatewayResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayCommandInput
  extends DeleteTransitGatewayRequest {}
export interface DeleteTransitGatewayCommandOutput
  extends DeleteTransitGatewayResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayCommand_base: {
  new (
    input: DeleteTransitGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayCommandInput,
    DeleteTransitGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayCommandInput,
    DeleteTransitGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayCommand extends DeleteTransitGatewayCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayRequest;
      output: DeleteTransitGatewayResult;
    };
    sdk: {
      input: DeleteTransitGatewayCommandInput;
      output: DeleteTransitGatewayCommandOutput;
    };
  };
}
