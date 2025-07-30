import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetNetworkInsightsAccessScopeAnalysisFindingsRequest,
  GetNetworkInsightsAccessScopeAnalysisFindingsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput
  extends GetNetworkInsightsAccessScopeAnalysisFindingsRequest {}
export interface GetNetworkInsightsAccessScopeAnalysisFindingsCommandOutput
  extends GetNetworkInsightsAccessScopeAnalysisFindingsResult,
    __MetadataBearer {}
declare const GetNetworkInsightsAccessScopeAnalysisFindingsCommand_base: {
  new (
    input: GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput,
    GetNetworkInsightsAccessScopeAnalysisFindingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput,
    GetNetworkInsightsAccessScopeAnalysisFindingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetNetworkInsightsAccessScopeAnalysisFindingsCommand extends GetNetworkInsightsAccessScopeAnalysisFindingsCommand_base {
  protected static __types: {
    api: {
      input: GetNetworkInsightsAccessScopeAnalysisFindingsRequest;
      output: GetNetworkInsightsAccessScopeAnalysisFindingsResult;
    };
    sdk: {
      input: GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput;
      output: GetNetworkInsightsAccessScopeAnalysisFindingsCommandOutput;
    };
  };
}
