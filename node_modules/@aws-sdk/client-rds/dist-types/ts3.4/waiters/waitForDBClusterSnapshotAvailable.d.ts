import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBClusterSnapshotsCommandInput } from "../commands/DescribeDBClusterSnapshotsCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBClusterSnapshotAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClusterSnapshotsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBClusterSnapshotAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClusterSnapshotsCommandInput
) => Promise<WaiterResult>;
