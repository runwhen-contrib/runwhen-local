import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeConversionTasksCommandInput } from "../commands/DescribeConversionTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForConversionTaskCompleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeConversionTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilConversionTaskCompleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeConversionTasksCommandInput
) => Promise<WaiterResult>;
