import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateInternetGatewayRequest,
  CreateInternetGatewayResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateInternetGatewayCommandInput
  extends CreateInternetGatewayRequest {}
export interface CreateInternetGatewayCommandOutput
  extends CreateInternetGatewayResult,
    __MetadataBearer {}
declare const CreateInternetGatewayCommand_base: {
  new (
    input: CreateInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInternetGatewayCommandInput,
    CreateInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateInternetGatewayCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInternetGatewayCommandInput,
    CreateInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateInternetGatewayCommand extends CreateInternetGatewayCommand_base {
  protected static __types: {
    api: {
      input: CreateInternetGatewayRequest;
      output: CreateInternetGatewayResult;
    };
    sdk: {
      input: CreateInternetGatewayCommandInput;
      output: CreateInternetGatewayCommandOutput;
    };
  };
}
