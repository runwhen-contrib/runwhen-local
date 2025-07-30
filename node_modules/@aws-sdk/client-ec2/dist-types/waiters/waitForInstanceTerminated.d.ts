import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilInstanceTerminated instead. waitForInstanceTerminated does not throw error in non-success cases.
 */
export declare const waitForInstanceTerminated: (params: WaiterConfiguration<EC2Client>, input: DescribeInstancesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeInstancesCommand for polling.
 */
export declare const waitUntilInstanceTerminated: (params: WaiterConfiguration<EC2Client>, input: DescribeInstancesCommandInput) => Promise<WaiterResult>;
