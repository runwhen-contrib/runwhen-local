import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeExportTasksCommandInput } from "../commands/DescribeExportTasksCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilExportTaskCompleted instead. waitForExportTaskCompleted does not throw error in non-success cases.
 */
export declare const waitForExportTaskCompleted: (params: WaiterConfiguration<EC2Client>, input: DescribeExportTasksCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeExportTasksCommand for polling.
 */
export declare const waitUntilExportTaskCompleted: (params: WaiterConfiguration<EC2Client>, input: DescribeExportTasksCommandInput) => Promise<WaiterResult>;
