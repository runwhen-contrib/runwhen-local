import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateDefaultSubnetRequest,
  CreateDefaultSubnetResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateDefaultSubnetCommandInput
  extends CreateDefaultSubnetRequest {}
export interface CreateDefaultSubnetCommandOutput
  extends CreateDefaultSubnetResult,
    __MetadataBearer {}
declare const CreateDefaultSubnetCommand_base: {
  new (
    input: CreateDefaultSubnetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDefaultSubnetCommandInput,
    CreateDefaultSubnetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDefaultSubnetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDefaultSubnetCommandInput,
    CreateDefaultSubnetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDefaultSubnetCommand extends CreateDefaultSubnetCommand_base {
  protected static __types: {
    api: {
      input: CreateDefaultSubnetRequest;
      output: CreateDefaultSubnetResult;
    };
    sdk: {
      input: CreateDefaultSubnetCommandInput;
      output: CreateDefaultSubnetCommandOutput;
    };
  };
}
