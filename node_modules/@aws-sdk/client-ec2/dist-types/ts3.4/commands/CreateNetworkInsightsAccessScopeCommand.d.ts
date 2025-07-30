import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateNetworkInsightsAccessScopeRequest,
  CreateNetworkInsightsAccessScopeResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateNetworkInsightsAccessScopeCommandInput
  extends CreateNetworkInsightsAccessScopeRequest {}
export interface CreateNetworkInsightsAccessScopeCommandOutput
  extends CreateNetworkInsightsAccessScopeResult,
    __MetadataBearer {}
declare const CreateNetworkInsightsAccessScopeCommand_base: {
  new (
    input: CreateNetworkInsightsAccessScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInsightsAccessScopeCommandInput,
    CreateNetworkInsightsAccessScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateNetworkInsightsAccessScopeCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInsightsAccessScopeCommandInput,
    CreateNetworkInsightsAccessScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateNetworkInsightsAccessScopeCommand extends CreateNetworkInsightsAccessScopeCommand_base {
  protected static __types: {
    api: {
      input: CreateNetworkInsightsAccessScopeRequest;
      output: CreateNetworkInsightsAccessScopeResult;
    };
    sdk: {
      input: CreateNetworkInsightsAccessScopeCommandInput;
      output: CreateNetworkInsightsAccessScopeCommandOutput;
    };
  };
}
