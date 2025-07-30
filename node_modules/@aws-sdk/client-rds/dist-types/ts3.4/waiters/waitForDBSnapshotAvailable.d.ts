import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBSnapshotsCommandInput } from "../commands/DescribeDBSnapshotsCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBSnapshotAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBSnapshotsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBSnapshotAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBSnapshotsCommandInput
) => Promise<WaiterResult>;
