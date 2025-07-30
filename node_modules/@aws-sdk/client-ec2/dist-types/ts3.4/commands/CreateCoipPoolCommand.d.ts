import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateCoipPoolRequest,
  CreateCoipPoolResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateCoipPoolCommandInput extends CreateCoipPoolRequest {}
export interface CreateCoipPoolCommandOutput
  extends CreateCoipPoolResult,
    __MetadataBearer {}
declare const CreateCoipPoolCommand_base: {
  new (
    input: CreateCoipPoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCoipPoolCommandInput,
    CreateCoipPoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCoipPoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCoipPoolCommandInput,
    CreateCoipPoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCoipPoolCommand extends CreateCoipPoolCommand_base {
  protected static __types: {
    api: {
      input: CreateCoipPoolRequest;
      output: CreateCoipPoolResult;
    };
    sdk: {
      input: CreateCoipPoolCommandInput;
      output: CreateCoipPoolCommandOutput;
    };
  };
}
