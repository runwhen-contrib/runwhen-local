import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeSnapshotsCommandInput } from "../commands/DescribeSnapshotsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForSnapshotCompleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSnapshotsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilSnapshotCompleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSnapshotsCommandInput
) => Promise<WaiterResult>;
