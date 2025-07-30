import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeImportSnapshotTasksCommandInput } from "../commands/DescribeImportSnapshotTasksCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilSnapshotImported instead. waitForSnapshotImported does not throw error in non-success cases.
 */
export declare const waitForSnapshotImported: (params: WaiterConfiguration<EC2Client>, input: DescribeImportSnapshotTasksCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeImportSnapshotTasksCommand for polling.
 */
export declare const waitUntilSnapshotImported: (params: WaiterConfiguration<EC2Client>, input: DescribeImportSnapshotTasksCommandInput) => Promise<WaiterResult>;
