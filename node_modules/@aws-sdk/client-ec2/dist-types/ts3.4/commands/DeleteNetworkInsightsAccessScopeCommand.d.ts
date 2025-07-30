import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteNetworkInsightsAccessScopeRequest,
  DeleteNetworkInsightsAccessScopeResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkInsightsAccessScopeCommandInput
  extends DeleteNetworkInsightsAccessScopeRequest {}
export interface DeleteNetworkInsightsAccessScopeCommandOutput
  extends DeleteNetworkInsightsAccessScopeResult,
    __MetadataBearer {}
declare const DeleteNetworkInsightsAccessScopeCommand_base: {
  new (
    input: DeleteNetworkInsightsAccessScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsAccessScopeCommandInput,
    DeleteNetworkInsightsAccessScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkInsightsAccessScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsAccessScopeCommandInput,
    DeleteNetworkInsightsAccessScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkInsightsAccessScopeCommand extends DeleteNetworkInsightsAccessScopeCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkInsightsAccessScopeRequest;
      output: DeleteNetworkInsightsAccessScopeResult;
    };
    sdk: {
      input: DeleteNetworkInsightsAccessScopeCommandInput;
      output: DeleteNetworkInsightsAccessScopeCommandOutput;
    };
  };
}
