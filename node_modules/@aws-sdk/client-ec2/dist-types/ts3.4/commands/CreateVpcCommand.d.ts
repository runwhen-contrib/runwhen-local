import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateVpcRequest, CreateVpcResult } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVpcCommandInput extends CreateVpcRequest {}
export interface CreateVpcCommandOutput
  extends CreateVpcResult,
    __MetadataBearer {}
declare const CreateVpcCommand_base: {
  new (
    input: CreateVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcCommandInput,
    CreateVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateVpcCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcCommandInput,
    CreateVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVpcCommand extends CreateVpcCommand_base {
  protected static __types: {
    api: {
      input: CreateVpcRequest;
      output: CreateVpcResult;
    };
    sdk: {
      input: CreateVpcCommandInput;
      output: CreateVpcCommandOutput;
    };
  };
}
