import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateFleetRequest, CreateFleetResult } from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateFleetCommandInput extends CreateFleetRequest {}
export interface CreateFleetCommandOutput
  extends CreateFleetResult,
    __MetadataBearer {}
declare const CreateFleetCommand_base: {
  new (
    input: CreateFleetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateFleetCommandInput,
    CreateFleetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateFleetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateFleetCommandInput,
    CreateFleetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateFleetCommand extends CreateFleetCommand_base {
  protected static __types: {
    api: {
      input: CreateFleetRequest;
      output: CreateFleetResult;
    };
    sdk: {
      input: CreateFleetCommandInput;
      output: CreateFleetCommandOutput;
    };
  };
}
