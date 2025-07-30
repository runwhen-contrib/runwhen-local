import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterAutomatedBackupMessage,
  DescribeDBClusterAutomatedBackupsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterAutomatedBackupsCommandInput
  extends DescribeDBClusterAutomatedBackupsMessage {}
export interface DescribeDBClusterAutomatedBackupsCommandOutput
  extends DBClusterAutomatedBackupMessage,
    __MetadataBearer {}
declare const DescribeDBClusterAutomatedBackupsCommand_base: {
  new (
    input: DescribeDBClusterAutomatedBackupsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterAutomatedBackupsCommandInput,
    DescribeDBClusterAutomatedBackupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBClusterAutomatedBackupsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterAutomatedBackupsCommandInput,
    DescribeDBClusterAutomatedBackupsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterAutomatedBackupsCommand extends DescribeDBClusterAutomatedBackupsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterAutomatedBackupsMessage;
      output: DBClusterAutomatedBackupMessage;
    };
    sdk: {
      input: DescribeDBClusterAutomatedBackupsCommandInput;
      output: DescribeDBClusterAutomatedBackupsCommandOutput;
    };
  };
}
