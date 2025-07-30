import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterParameterGroupsMessage,
  DescribeDBClusterParameterGroupsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterParameterGroupsCommandInput
  extends DescribeDBClusterParameterGroupsMessage {}
export interface DescribeDBClusterParameterGroupsCommandOutput
  extends DBClusterParameterGroupsMessage,
    __MetadataBearer {}
declare const DescribeDBClusterParameterGroupsCommand_base: {
  new (
    input: DescribeDBClusterParameterGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterParameterGroupsCommandInput,
    DescribeDBClusterParameterGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBClusterParameterGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterParameterGroupsCommandInput,
    DescribeDBClusterParameterGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterParameterGroupsCommand extends DescribeDBClusterParameterGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterParameterGroupsMessage;
      output: DBClusterParameterGroupsMessage;
    };
    sdk: {
      input: DescribeDBClusterParameterGroupsCommandInput;
      output: DescribeDBClusterParameterGroupsCommandOutput;
    };
  };
}
