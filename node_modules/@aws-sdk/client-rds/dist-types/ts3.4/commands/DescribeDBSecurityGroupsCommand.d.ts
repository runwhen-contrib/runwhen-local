import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBSecurityGroupMessage,
  DescribeDBSecurityGroupsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBSecurityGroupsCommandInput
  extends DescribeDBSecurityGroupsMessage {}
export interface DescribeDBSecurityGroupsCommandOutput
  extends DBSecurityGroupMessage,
    __MetadataBearer {}
declare const DescribeDBSecurityGroupsCommand_base: {
  new (
    input: DescribeDBSecurityGroupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSecurityGroupsCommandInput,
    DescribeDBSecurityGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBSecurityGroupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSecurityGroupsCommandInput,
    DescribeDBSecurityGroupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBSecurityGroupsCommand extends DescribeDBSecurityGroupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBSecurityGroupsMessage;
      output: DBSecurityGroupMessage;
    };
    sdk: {
      input: DescribeDBSecurityGroupsCommandInput;
      output: DescribeDBSecurityGroupsCommandOutput;
    };
  };
}
