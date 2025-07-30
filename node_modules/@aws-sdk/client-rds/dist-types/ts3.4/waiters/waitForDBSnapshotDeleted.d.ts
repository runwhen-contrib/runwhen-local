import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBSnapshotsCommandInput } from "../commands/DescribeDBSnapshotsCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBSnapshotDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBSnapshotsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBSnapshotDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBSnapshotsCommandInput
) => Promise<WaiterResult>;
