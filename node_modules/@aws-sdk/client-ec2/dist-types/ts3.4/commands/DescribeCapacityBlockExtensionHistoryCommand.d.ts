import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCapacityBlockExtensionHistoryRequest,
  DescribeCapacityBlockExtensionHistoryResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCapacityBlockExtensionHistoryCommandInput
  extends DescribeCapacityBlockExtensionHistoryRequest {}
export interface DescribeCapacityBlockExtensionHistoryCommandOutput
  extends DescribeCapacityBlockExtensionHistoryResult,
    __MetadataBearer {}
declare const DescribeCapacityBlockExtensionHistoryCommand_base: {
  new (
    input: DescribeCapacityBlockExtensionHistoryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityBlockExtensionHistoryCommandInput,
    DescribeCapacityBlockExtensionHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeCapacityBlockExtensionHistoryCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityBlockExtensionHistoryCommandInput,
    DescribeCapacityBlockExtensionHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCapacityBlockExtensionHistoryCommand extends DescribeCapacityBlockExtensionHistoryCommand_base {
  protected static __types: {
    api: {
      input: DescribeCapacityBlockExtensionHistoryRequest;
      output: DescribeCapacityBlockExtensionHistoryResult;
    };
    sdk: {
      input: DescribeCapacityBlockExtensionHistoryCommandInput;
      output: DescribeCapacityBlockExtensionHistoryCommandOutput;
    };
  };
}
