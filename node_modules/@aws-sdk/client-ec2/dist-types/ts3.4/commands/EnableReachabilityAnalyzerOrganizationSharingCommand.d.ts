import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  EnableReachabilityAnalyzerOrganizationSharingRequest,
  EnableReachabilityAnalyzerOrganizationSharingResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableReachabilityAnalyzerOrganizationSharingCommandInput
  extends EnableReachabilityAnalyzerOrganizationSharingRequest {}
export interface EnableReachabilityAnalyzerOrganizationSharingCommandOutput
  extends EnableReachabilityAnalyzerOrganizationSharingResult,
    __MetadataBearer {}
declare const EnableReachabilityAnalyzerOrganizationSharingCommand_base: {
  new (
    input: EnableReachabilityAnalyzerOrganizationSharingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableReachabilityAnalyzerOrganizationSharingCommandInput,
    EnableReachabilityAnalyzerOrganizationSharingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [EnableReachabilityAnalyzerOrganizationSharingCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    EnableReachabilityAnalyzerOrganizationSharingCommandInput,
    EnableReachabilityAnalyzerOrganizationSharingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableReachabilityAnalyzerOrganizationSharingCommand extends EnableReachabilityAnalyzerOrganizationSharingCommand_base {
  protected static __types: {
    api: {
      input: EnableReachabilityAnalyzerOrganizationSharingRequest;
      output: EnableReachabilityAnalyzerOrganizationSharingResult;
    };
    sdk: {
      input: EnableReachabilityAnalyzerOrganizationSharingCommandInput;
      output: EnableReachabilityAnalyzerOrganizationSharingCommandOutput;
    };
  };
}
