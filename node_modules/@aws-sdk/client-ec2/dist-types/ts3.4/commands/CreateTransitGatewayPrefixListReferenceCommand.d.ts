import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateTransitGatewayPrefixListReferenceRequest,
  CreateTransitGatewayPrefixListReferenceResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateTransitGatewayPrefixListReferenceCommandInput
  extends CreateTransitGatewayPrefixListReferenceRequest {}
export interface CreateTransitGatewayPrefixListReferenceCommandOutput
  extends CreateTransitGatewayPrefixListReferenceResult,
    __MetadataBearer {}
declare const CreateTransitGatewayPrefixListReferenceCommand_base: {
  new (
    input: CreateTransitGatewayPrefixListReferenceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayPrefixListReferenceCommandInput,
    CreateTransitGatewayPrefixListReferenceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTransitGatewayPrefixListReferenceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTransitGatewayPrefixListReferenceCommandInput,
    CreateTransitGatewayPrefixListReferenceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTransitGatewayPrefixListReferenceCommand extends CreateTransitGatewayPrefixListReferenceCommand_base {
  protected static __types: {
    api: {
      input: CreateTransitGatewayPrefixListReferenceRequest;
      output: CreateTransitGatewayPrefixListReferenceResult;
    };
    sdk: {
      input: CreateTransitGatewayPrefixListReferenceCommandInput;
      output: CreateTransitGatewayPrefixListReferenceCommandOutput;
    };
  };
}
