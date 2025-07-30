import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateEgressOnlyInternetGatewayRequest,
  CreateEgressOnlyInternetGatewayResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateEgressOnlyInternetGatewayCommandInput
  extends CreateEgressOnlyInternetGatewayRequest {}
export interface CreateEgressOnlyInternetGatewayCommandOutput
  extends CreateEgressOnlyInternetGatewayResult,
    __MetadataBearer {}
declare const CreateEgressOnlyInternetGatewayCommand_base: {
  new (
    input: CreateEgressOnlyInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateEgressOnlyInternetGatewayCommandInput,
    CreateEgressOnlyInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateEgressOnlyInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateEgressOnlyInternetGatewayCommandInput,
    CreateEgressOnlyInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateEgressOnlyInternetGatewayCommand extends CreateEgressOnlyInternetGatewayCommand_base {
  protected static __types: {
    api: {
      input: CreateEgressOnlyInternetGatewayRequest;
      output: CreateEgressOnlyInternetGatewayResult;
    };
    sdk: {
      input: CreateEgressOnlyInternetGatewayCommandInput;
      output: CreateEgressOnlyInternetGatewayCommandOutput;
    };
  };
}
