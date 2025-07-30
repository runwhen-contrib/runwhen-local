import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateCarrierGatewayRequest,
  CreateCarrierGatewayResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateCarrierGatewayCommandInput
  extends CreateCarrierGatewayRequest {}
export interface CreateCarrierGatewayCommandOutput
  extends CreateCarrierGatewayResult,
    __MetadataBearer {}
declare const CreateCarrierGatewayCommand_base: {
  new (
    input: CreateCarrierGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCarrierGatewayCommandInput,
    CreateCarrierGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCarrierGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCarrierGatewayCommandInput,
    CreateCarrierGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCarrierGatewayCommand extends CreateCarrierGatewayCommand_base {
  protected static __types: {
    api: {
      input: CreateCarrierGatewayRequest;
      output: CreateCarrierGatewayResult;
    };
    sdk: {
      input: CreateCarrierGatewayCommandInput;
      output: CreateCarrierGatewayCommandOutput;
    };
  };
}
