import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilInstanceRunning instead. waitForInstanceRunning does not throw error in non-success cases.
 */
export declare const waitForInstanceRunning: (params: WaiterConfiguration<EC2Client>, input: DescribeInstancesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeInstancesCommand for polling.
 */
export declare const waitUntilInstanceRunning: (params: WaiterConfiguration<EC2Client>, input: DescribeInstancesCommandInput) => Promise<WaiterResult>;
