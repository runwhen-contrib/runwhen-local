import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBInstanceMessage,
  DescribeDBInstancesMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBInstancesCommandInput
  extends DescribeDBInstancesMessage {}
export interface DescribeDBInstancesCommandOutput
  extends DBInstanceMessage,
    __MetadataBearer {}
declare const DescribeDBInstancesCommand_base: {
  new (
    input: DescribeDBInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBInstancesCommandInput,
    DescribeDBInstancesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBInstancesCommandInput,
    DescribeDBInstancesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBInstancesCommand extends DescribeDBInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBInstancesMessage;
      output: DBInstanceMessage;
    };
    sdk: {
      input: DescribeDBInstancesCommandInput;
      output: DescribeDBInstancesCommandOutput;
    };
  };
}
