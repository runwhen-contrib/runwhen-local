import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBShardGroupsMessage,
  DescribeDBShardGroupsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBShardGroupsCommandInput
  extends DescribeDBShardGroupsMessage {}
export interface DescribeDBShardGroupsCommandOutput
  extends DescribeDBShardGroupsResponse,
    __MetadataBearer {}
declare const DescribeDBShardGroupsCommand_base: {
  new (
    input: DescribeDBShardGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBShardGroupsCommandInput,
    DescribeDBShardGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBShardGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBShardGroupsCommandInput,
    DescribeDBShardGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBShardGroupsCommand extends DescribeDBShardGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBShardGroupsMessage;
      output: DescribeDBShardGroupsResponse;
    };
    sdk: {
      input: DescribeDBShardGroupsCommandInput;
      output: DescribeDBShardGroupsCommandOutput;
    };
  };
}
