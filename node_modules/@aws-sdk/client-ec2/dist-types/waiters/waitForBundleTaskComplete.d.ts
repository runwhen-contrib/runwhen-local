import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeBundleTasksCommandInput } from "../commands/DescribeBundleTasksCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilBundleTaskComplete instead. waitForBundleTaskComplete does not throw error in non-success cases.
 */
export declare const waitForBundleTaskComplete: (params: WaiterConfiguration<EC2Client>, input: DescribeBundleTasksCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeBundleTasksCommand for polling.
 */
export declare const waitUntilBundleTaskComplete: (params: WaiterConfiguration<EC2Client>, input: DescribeBundleTasksCommandInput) => Promise<WaiterResult>;
