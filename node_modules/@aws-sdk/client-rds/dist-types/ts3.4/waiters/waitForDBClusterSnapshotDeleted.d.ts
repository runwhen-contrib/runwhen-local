import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBClusterSnapshotsCommandInput } from "../commands/DescribeDBClusterSnapshotsCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBClusterSnapshotDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClusterSnapshotsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBClusterSnapshotDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClusterSnapshotsCommandInput
) => Promise<WaiterResult>;
