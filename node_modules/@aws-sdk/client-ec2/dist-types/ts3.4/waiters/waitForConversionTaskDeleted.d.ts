import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeConversionTasksCommandInput } from "../commands/DescribeConversionTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForConversionTaskDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeConversionTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilConversionTaskDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeConversionTasksCommandInput
) => Promise<WaiterResult>;
