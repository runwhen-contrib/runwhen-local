import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBSnapshotTenantDatabasesMessage,
  DescribeDBSnapshotTenantDatabasesMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBSnapshotTenantDatabasesCommandInput
  extends DescribeDBSnapshotTenantDatabasesMessage {}
export interface DescribeDBSnapshotTenantDatabasesCommandOutput
  extends DBSnapshotTenantDatabasesMessage,
    __MetadataBearer {}
declare const DescribeDBSnapshotTenantDatabasesCommand_base: {
  new (
    input: DescribeDBSnapshotTenantDatabasesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSnapshotTenantDatabasesCommandInput,
    DescribeDBSnapshotTenantDatabasesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBSnapshotTenantDatabasesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBSnapshotTenantDatabasesCommandInput,
    DescribeDBSnapshotTenantDatabasesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBSnapshotTenantDatabasesCommand extends DescribeDBSnapshotTenantDatabasesCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBSnapshotTenantDatabasesMessage;
      output: DBSnapshotTenantDatabasesMessage;
    };
    sdk: {
      input: DescribeDBSnapshotTenantDatabasesCommandInput;
      output: DescribeDBSnapshotTenantDatabasesCommandOutput;
    };
  };
}
