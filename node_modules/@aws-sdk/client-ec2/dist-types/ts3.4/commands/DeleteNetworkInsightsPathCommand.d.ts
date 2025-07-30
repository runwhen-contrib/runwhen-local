import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteNetworkInsightsPathRequest,
  DeleteNetworkInsightsPathResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkInsightsPathCommandInput
  extends DeleteNetworkInsightsPathRequest {}
export interface DeleteNetworkInsightsPathCommandOutput
  extends DeleteNetworkInsightsPathResult,
    __MetadataBearer {}
declare const DeleteNetworkInsightsPathCommand_base: {
  new (
    input: DeleteNetworkInsightsPathCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsPathCommandInput,
    DeleteNetworkInsightsPathCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkInsightsPathCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkInsightsPathCommandInput,
    DeleteNetworkInsightsPathCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkInsightsPathCommand extends DeleteNetworkInsightsPathCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkInsightsPathRequest;
      output: DeleteNetworkInsightsPathResult;
    };
    sdk: {
      input: DeleteNetworkInsightsPathCommandInput;
      output: DeleteNetworkInsightsPathCommandOutput;
    };
  };
}
