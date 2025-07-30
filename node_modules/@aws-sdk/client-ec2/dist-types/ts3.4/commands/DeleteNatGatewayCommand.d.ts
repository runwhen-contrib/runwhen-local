import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteNatGatewayRequest,
  DeleteNatGatewayResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNatGatewayCommandInput extends DeleteNatGatewayRequest {}
export interface DeleteNatGatewayCommandOutput
  extends DeleteNatGatewayResult,
    __MetadataBearer {}
declare const DeleteNatGatewayCommand_base: {
  new (
    input: DeleteNatGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNatGatewayCommandInput,
    DeleteNatGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNatGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNatGatewayCommandInput,
    DeleteNatGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNatGatewayCommand extends DeleteNatGatewayCommand_base {
  protected static __types: {
    api: {
      input: DeleteNatGatewayRequest;
      output: DeleteNatGatewayResult;
    };
    sdk: {
      input: DeleteNatGatewayCommandInput;
      output: DeleteNatGatewayCommandOutput;
    };
  };
}
