import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterSnapshotMessage,
  DescribeDBClusterSnapshotsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterSnapshotsCommandInput
  extends DescribeDBClusterSnapshotsMessage {}
export interface DescribeDBClusterSnapshotsCommandOutput
  extends DBClusterSnapshotMessage,
    __MetadataBearer {}
declare const DescribeDBClusterSnapshotsCommand_base: {
  new (
    input: DescribeDBClusterSnapshotsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterSnapshotsCommandInput,
    DescribeDBClusterSnapshotsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBClusterSnapshotsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterSnapshotsCommandInput,
    DescribeDBClusterSnapshotsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterSnapshotsCommand extends DescribeDBClusterSnapshotsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterSnapshotsMessage;
      output: DBClusterSnapshotMessage;
    };
    sdk: {
      input: DescribeDBClusterSnapshotsCommandInput;
      output: DescribeDBClusterSnapshotsCommandOutput;
    };
  };
}
