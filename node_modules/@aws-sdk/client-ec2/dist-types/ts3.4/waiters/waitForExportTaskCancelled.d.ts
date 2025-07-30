import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeExportTasksCommandInput } from "../commands/DescribeExportTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForExportTaskCancelled: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeExportTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilExportTaskCancelled: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeExportTasksCommandInput
) => Promise<WaiterResult>;
