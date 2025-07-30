import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateFlowLogsRequest,
  CreateFlowLogsResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateFlowLogsCommandInput extends CreateFlowLogsRequest {}
export interface CreateFlowLogsCommandOutput
  extends CreateFlowLogsResult,
    __MetadataBearer {}
declare const CreateFlowLogsCommand_base: {
  new (
    input: CreateFlowLogsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateFlowLogsCommandInput,
    CreateFlowLogsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateFlowLogsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateFlowLogsCommandInput,
    CreateFlowLogsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateFlowLogsCommand extends CreateFlowLogsCommand_base {
  protected static __types: {
    api: {
      input: CreateFlowLogsRequest;
      output: CreateFlowLogsResult;
    };
    sdk: {
      input: CreateFlowLogsCommandInput;
      output: CreateFlowLogsCommandOutput;
    };
  };
}
