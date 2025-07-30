import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBSubnetGroupMessage,
  DescribeDBSubnetGroupsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBSubnetGroupsCommandInput
  extends DescribeDBSubnetGroupsMessage {}
export interface DescribeDBSubnetGroupsCommandOutput
  extends DBSubnetGroupMessage,
    __MetadataBearer {}
declare const DescribeDBSubnetGroupsCommand_base: {
  new (
    input: DescribeDBSubnetGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSubnetGroupsCommandInput,
    DescribeDBSubnetGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBSubnetGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSubnetGroupsCommandInput,
    DescribeDBSubnetGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBSubnetGroupsCommand extends DescribeDBSubnetGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBSubnetGroupsMessage;
      output: DBSubnetGroupMessage;
    };
    sdk: {
      input: DescribeDBSubnetGroupsCommandInput;
      output: DescribeDBSubnetGroupsCommandOutput;
    };
  };
}
