import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateCustomerGatewayRequest,
  CreateCustomerGatewayResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateCustomerGatewayCommandInput
  extends CreateCustomerGatewayRequest {}
export interface CreateCustomerGatewayCommandOutput
  extends CreateCustomerGatewayResult,
    __MetadataBearer {}
declare const CreateCustomerGatewayCommand_base: {
  new (
    input: CreateCustomerGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCustomerGatewayCommandInput,
    CreateCustomerGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCustomerGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCustomerGatewayCommandInput,
    CreateCustomerGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCustomerGatewayCommand extends CreateCustomerGatewayCommand_base {
  protected static __types: {
    api: {
      input: CreateCustomerGatewayRequest;
      output: CreateCustomerGatewayResult;
    };
    sdk: {
      input: CreateCustomerGatewayCommandInput;
      output: CreateCustomerGatewayCommandOutput;
    };
  };
}
