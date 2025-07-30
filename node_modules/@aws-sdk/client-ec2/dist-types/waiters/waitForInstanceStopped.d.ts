import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilInstanceStopped instead. waitForInstanceStopped does not throw error in non-success cases.
 */
export declare const waitForInstanceStopped: (params: WaiterConfiguration<EC2Client>, input: DescribeInstancesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeInstancesCommand for polling.
 */
export declare const waitUntilInstanceStopped: (params: WaiterConfiguration<EC2Client>, input: DescribeInstancesCommandInput) => Promise<WaiterResult>;
