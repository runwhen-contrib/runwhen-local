import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeBundleTasksRequest,
  DescribeBundleTasksResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeBundleTasksCommandInput
  extends DescribeBundleTasksRequest {}
export interface DescribeBundleTasksCommandOutput
  extends DescribeBundleTasksResult,
    __MetadataBearer {}
declare const DescribeBundleTasksCommand_base: {
  new (
    input: DescribeBundleTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeBundleTasksCommandInput,
    DescribeBundleTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeBundleTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeBundleTasksCommandInput,
    DescribeBundleTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeBundleTasksCommand extends DescribeBundleTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeBundleTasksRequest;
      output: DescribeBundleTasksResult;
    };
    sdk: {
      input: DescribeBundleTasksCommandInput;
      output: DescribeBundleTasksCommandOutput;
    };
  };
}
