import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeStoreImageTasksCommandInput } from "../commands/DescribeStoreImageTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForStoreImageTaskComplete: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeStoreImageTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilStoreImageTaskComplete: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeStoreImageTasksCommandInput
) => Promise<WaiterResult>;
