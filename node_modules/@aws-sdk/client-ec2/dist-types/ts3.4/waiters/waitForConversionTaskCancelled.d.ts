import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeConversionTasksCommandInput } from "../commands/DescribeConversionTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForConversionTaskCancelled: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeConversionTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilConversionTaskCancelled: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeConversionTasksCommandInput
) => Promise<WaiterResult>;
