import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateNetworkInsightsPathRequest,
  CreateNetworkInsightsPathResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateNetworkInsightsPathCommandInput
  extends CreateNetworkInsightsPathRequest {}
export interface CreateNetworkInsightsPathCommandOutput
  extends CreateNetworkInsightsPathResult,
    __MetadataBearer {}
declare const CreateNetworkInsightsPathCommand_base: {
  new (
    input: CreateNetworkInsightsPathCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInsightsPathCommandInput,
    CreateNetworkInsightsPathCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateNetworkInsightsPathCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInsightsPathCommandInput,
    CreateNetworkInsightsPathCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateNetworkInsightsPathCommand extends CreateNetworkInsightsPathCommand_base {
  protected static __types: {
    api: {
      input: CreateNetworkInsightsPathRequest;
      output: CreateNetworkInsightsPathResult;
    };
    sdk: {
      input: CreateNetworkInsightsPathCommandInput;
      output: CreateNetworkInsightsPathCommandOutput;
    };
  };
}
