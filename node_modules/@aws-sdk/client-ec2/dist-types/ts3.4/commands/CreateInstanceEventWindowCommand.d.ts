import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateInstanceEventWindowRequest,
  CreateInstanceEventWindowResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateInstanceEventWindowCommandInput
  extends CreateInstanceEventWindowRequest {}
export interface CreateInstanceEventWindowCommandOutput
  extends CreateInstanceEventWindowResult,
    __MetadataBearer {}
declare const CreateInstanceEventWindowCommand_base: {
  new (
    input: CreateInstanceEventWindowCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInstanceEventWindowCommandInput,
    CreateInstanceEventWindowCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateInstanceEventWindowCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateInstanceEventWindowCommandInput,
    CreateInstanceEventWindowCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateInstanceEventWindowCommand extends CreateInstanceEventWindowCommand_base {
  protected static __types: {
    api: {
      input: CreateInstanceEventWindowRequest;
      output: CreateInstanceEventWindowResult;
    };
    sdk: {
      input: CreateInstanceEventWindowCommandInput;
      output: CreateInstanceEventWindowCommandOutput;
    };
  };
}
