import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateSubnetRequest, CreateSubnetResult } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateSubnetCommandInput extends CreateSubnetRequest {}
export interface CreateSubnetCommandOutput
  extends CreateSubnetResult,
    __MetadataBearer {}
declare const CreateSubnetCommand_base: {
  new (
    input: CreateSubnetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSubnetCommandInput,
    CreateSubnetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateSubnetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSubnetCommandInput,
    CreateSubnetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateSubnetCommand extends CreateSubnetCommand_base {
  protected static __types: {
    api: {
      input: CreateSubnetRequest;
      output: CreateSubnetResult;
    };
    sdk: {
      input: CreateSubnetCommandInput;
      output: CreateSubnetCommandOutput;
    };
  };
}
