import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteNetworkInsightsAnalysisRequest,
  DeleteNetworkInsightsAnalysisResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkInsightsAnalysisCommandInput
  extends DeleteNetworkInsightsAnalysisRequest {}
export interface DeleteNetworkInsightsAnalysisCommandOutput
  extends DeleteNetworkInsightsAnalysisResult,
    __MetadataBearer {}
declare const DeleteNetworkInsightsAnalysisCommand_base: {
  new (
    input: DeleteNetworkInsightsAnalysisCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsAnalysisCommandInput,
    DeleteNetworkInsightsAnalysisCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkInsightsAnalysisCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsAnalysisCommandInput,
    DeleteNetworkInsightsAnalysisCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkInsightsAnalysisCommand extends DeleteNetworkInsightsAnalysisCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkInsightsAnalysisRequest;
      output: DeleteNetworkInsightsAnalysisResult;
    };
    sdk: {
      input: DeleteNetworkInsightsAnalysisCommandInput;
      output: DeleteNetworkInsightsAnalysisCommandOutput;
    };
  };
}
