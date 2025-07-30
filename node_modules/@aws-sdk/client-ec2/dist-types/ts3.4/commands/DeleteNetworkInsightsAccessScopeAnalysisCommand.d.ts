import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteNetworkInsightsAccessScopeAnalysisRequest,
  DeleteNetworkInsightsAccessScopeAnalysisResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkInsightsAccessScopeAnalysisCommandInput
  extends DeleteNetworkInsightsAccessScopeAnalysisRequest {}
export interface DeleteNetworkInsightsAccessScopeAnalysisCommandOutput
  extends DeleteNetworkInsightsAccessScopeAnalysisResult,
    __MetadataBearer {}
declare const DeleteNetworkInsightsAccessScopeAnalysisCommand_base: {
  new (
    input: DeleteNetworkInsightsAccessScopeAnalysisCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsAccessScopeAnalysisCommandInput,
    DeleteNetworkInsightsAccessScopeAnalysisCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkInsightsAccessScopeAnalysisCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsAccessScopeAnalysisCommandInput,
    DeleteNetworkInsightsAccessScopeAnalysisCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkInsightsAccessScopeAnalysisCommand extends DeleteNetworkInsightsAccessScopeAnalysisCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkInsightsAccessScopeAnalysisRequest;
      output: DeleteNetworkInsightsAccessScopeAnalysisResult;
    };
    sdk: {
      input: DeleteNetworkInsightsAccessScopeAnalysisCommandInput;
      output: DeleteNetworkInsightsAccessScopeAnalysisCommandOutput;
    };
  };
}
