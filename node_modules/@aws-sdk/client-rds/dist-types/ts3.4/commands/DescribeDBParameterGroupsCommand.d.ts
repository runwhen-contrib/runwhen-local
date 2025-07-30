import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBParameterGroupsMessage,
  DescribeDBParameterGroupsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBParameterGroupsCommandInput
  extends DescribeDBParameterGroupsMessage {}
export interface DescribeDBParameterGroupsCommandOutput
  extends DBParameterGroupsMessage,
    __MetadataBearer {}
declare const DescribeDBParameterGroupsCommand_base: {
  new (
    input: DescribeDBParameterGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBParameterGroupsCommandInput,
    DescribeDBParameterGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBParameterGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBParameterGroupsCommandInput,
    DescribeDBParameterGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBParameterGroupsCommand extends DescribeDBParameterGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBParameterGroupsMessage;
      output: DBParameterGroupsMessage;
    };
    sdk: {
      input: DescribeDBParameterGroupsCommandInput;
      output: DescribeDBParameterGroupsCommandOutput;
    };
  };
}
