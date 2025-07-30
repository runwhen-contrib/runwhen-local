import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeImportSnapshotTasksCommandInput } from "../commands/DescribeImportSnapshotTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForSnapshotImported: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeImportSnapshotTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilSnapshotImported: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeImportSnapshotTasksCommandInput
) => Promise<WaiterResult>;
