import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetNetworkInsightsAccessScopeContentRequest,
  GetNetworkInsightsAccessScopeContentResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetNetworkInsightsAccessScopeContentCommandInput
  extends GetNetworkInsightsAccessScopeContentRequest {}
export interface GetNetworkInsightsAccessScopeContentCommandOutput
  extends GetNetworkInsightsAccessScopeContentResult,
    __MetadataBearer {}
declare const GetNetworkInsightsAccessScopeContentCommand_base: {
  new (
    input: GetNetworkInsightsAccessScopeContentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetNetworkInsightsAccessScopeContentCommandInput,
    GetNetworkInsightsAccessScopeContentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetNetworkInsightsAccessScopeContentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetNetworkInsightsAccessScopeContentCommandInput,
    GetNetworkInsightsAccessScopeContentCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetNetworkInsightsAccessScopeContentCommand extends GetNetworkInsightsAccessScopeContentCommand_base {
  protected static __types: {
    api: {
      input: GetNetworkInsightsAccessScopeContentRequest;
      output: GetNetworkInsightsAccessScopeContentResult;
    };
    sdk: {
      input: GetNetworkInsightsAccessScopeContentCommandInput;
      output: GetNetworkInsightsAccessScopeContentCommandOutput;
    };
  };
}
