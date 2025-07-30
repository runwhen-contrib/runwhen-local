import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBInstanceAutomatedBackupMessage,
  DescribeDBInstanceAutomatedBackupsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBInstanceAutomatedBackupsCommandInput
  extends DescribeDBInstanceAutomatedBackupsMessage {}
export interface DescribeDBInstanceAutomatedBackupsCommandOutput
  extends DBInstanceAutomatedBackupMessage,
    __MetadataBearer {}
declare const DescribeDBInstanceAutomatedBackupsCommand_base: {
  new (
    input: DescribeDBInstanceAutomatedBackupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBInstanceAutomatedBackupsCommandInput,
    DescribeDBInstanceAutomatedBackupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBInstanceAutomatedBackupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBInstanceAutomatedBackupsCommandInput,
    DescribeDBInstanceAutomatedBackupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBInstanceAutomatedBackupsCommand extends DescribeDBInstanceAutomatedBackupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBInstanceAutomatedBackupsMessage;
      output: DBInstanceAutomatedBackupMessage;
    };
    sdk: {
      input: DescribeDBInstanceAutomatedBackupsCommandInput;
      output: DescribeDBInstanceAutomatedBackupsCommandOutput;
    };
  };
}
