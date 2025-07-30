import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeReplaceRootVolumeTasksRequest,
  DescribeReplaceRootVolumeTasksResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeReplaceRootVolumeTasksCommandInput
  extends DescribeReplaceRootVolumeTasksRequest {}
export interface DescribeReplaceRootVolumeTasksCommandOutput
  extends DescribeReplaceRootVolumeTasksResult,
    __MetadataBearer {}
declare const DescribeReplaceRootVolumeTasksCommand_base: {
  new (
    input: DescribeReplaceRootVolumeTasksCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReplaceRootVolumeTasksCommandInput,
    DescribeReplaceRootVolumeTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReplaceRootVolumeTasksCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReplaceRootVolumeTasksCommandInput,
    DescribeReplaceRootVolumeTasksCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReplaceRootVolumeTasksCommand extends DescribeReplaceRootVolumeTasksCommand_base {
  protected static __types: {
    api: {
      input: DescribeReplaceRootVolumeTasksRequest;
      output: DescribeReplaceRootVolumeTasksResult;
    };
    sdk: {
      input: DescribeReplaceRootVolumeTasksCommandInput;
      output: DescribeReplaceRootVolumeTasksCommandOutput;
    };
  };
}
