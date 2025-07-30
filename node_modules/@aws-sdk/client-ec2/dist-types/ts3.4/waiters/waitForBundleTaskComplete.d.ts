import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeBundleTasksCommandInput } from "../commands/DescribeBundleTasksCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForBundleTaskComplete: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeBundleTasksCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilBundleTaskComplete: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeBundleTasksCommandInput
) => Promise<WaiterResult>;
