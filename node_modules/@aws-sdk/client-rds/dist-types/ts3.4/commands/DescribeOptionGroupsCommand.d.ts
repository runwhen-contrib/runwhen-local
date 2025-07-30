import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DescribeOptionGroupsMessage, OptionGroups } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeOptionGroupsCommandInput
  extends DescribeOptionGroupsMessage {}
export interface DescribeOptionGroupsCommandOutput
  extends OptionGroups,
    __MetadataBearer {}
declare const DescribeOptionGroupsCommand_base: {
  new (
    input: DescribeOptionGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeOptionGroupsCommandInput,
    DescribeOptionGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeOptionGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeOptionGroupsCommandInput,
    DescribeOptionGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeOptionGroupsCommand extends DescribeOptionGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeOptionGroupsMessage;
      output: OptionGroups;
    };
    sdk: {
      input: DescribeOptionGroupsCommandInput;
      output: DescribeOptionGroupsCommandOutput;
    };
  };
}
