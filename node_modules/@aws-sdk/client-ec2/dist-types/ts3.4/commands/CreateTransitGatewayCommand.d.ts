import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayRequest,
  CreateTransitGatewayResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayCommandInput
  extends CreateTransitGatewayRequest {}
export interface CreateTransitGatewayCommandOutput
  extends CreateTransitGatewayResult,
    __MetadataBearer {}
declare const CreateTransitGatewayCommand_base: {
  new (
    input: CreateTransitGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayCommandInput,
    CreateTransitGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateTransitGatewayCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayCommandInput,
    CreateTransitGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayCommand extends CreateTransitGatewayCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayRequest;
      output: CreateTransitGatewayResult;
    };
    sdk: {
      input: CreateTransitGatewayCommandInput;
      output: CreateTransitGatewayCommandOutput;
    };
  };
}
