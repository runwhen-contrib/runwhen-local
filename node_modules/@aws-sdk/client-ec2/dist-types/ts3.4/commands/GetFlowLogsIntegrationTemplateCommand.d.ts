import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetFlowLogsIntegrationTemplateRequest,
  GetFlowLogsIntegrationTemplateResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetFlowLogsIntegrationTemplateCommandInput
  extends GetFlowLogsIntegrationTemplateRequest {}
export interface GetFlowLogsIntegrationTemplateCommandOutput
  extends GetFlowLogsIntegrationTemplateResult,
    __MetadataBearer {}
declare const GetFlowLogsIntegrationTemplateCommand_base: {
  new (
    input: GetFlowLogsIntegrationTemplateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetFlowLogsIntegrationTemplateCommandInput,
    GetFlowLogsIntegrationTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetFlowLogsIntegrationTemplateCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetFlowLogsIntegrationTemplateCommandInput,
    GetFlowLogsIntegrationTemplateCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetFlowLogsIntegrationTemplateCommand extends GetFlowLogsIntegrationTemplateCommand_base {
  protected static __types: {
    api: {
      input: GetFlowLogsIntegrationTemplateRequest;
      output: GetFlowLogsIntegrationTemplateResult;
    };
    sdk: {
      input: GetFlowLogsIntegrationTemplateCommandInput;
      output: GetFlowLogsIntegrationTemplateCommandOutput;
    };
  };
}
