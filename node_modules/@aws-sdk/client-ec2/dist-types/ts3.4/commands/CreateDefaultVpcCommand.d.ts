import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateDefaultVpcRequest,
  CreateDefaultVpcResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateDefaultVpcCommandInput extends CreateDefaultVpcRequest {}
export interface CreateDefaultVpcCommandOutput
  extends CreateDefaultVpcResult,
    __MetadataBearer {}
declare const CreateDefaultVpcCommand_base: {
  new (
    input: CreateDefaultVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDefaultVpcCommandInput,
    CreateDefaultVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateDefaultVpcCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDefaultVpcCommandInput,
    CreateDefaultVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDefaultVpcCommand extends CreateDefaultVpcCommand_base {
  protected static __types: {
    api: {
      input: CreateDefaultVpcRequest;
      output: CreateDefaultVpcResult;
    };
    sdk: {
      input: CreateDefaultVpcCommandInput;
      output: CreateDefaultVpcCommandOutput;
    };
  };
}
