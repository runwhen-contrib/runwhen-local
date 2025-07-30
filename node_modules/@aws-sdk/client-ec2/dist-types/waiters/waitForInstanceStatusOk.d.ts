import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstanceStatusCommandInput } from "../commands/DescribeInstanceStatusCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilInstanceStatusOk instead. waitForInstanceStatusOk does not throw error in non-success cases.
 */
export declare const waitForInstanceStatusOk: (params: WaiterConfiguration<EC2Client>, input: DescribeInstanceStatusCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeInstanceStatusCommand for polling.
 */
export declare const waitUntilInstanceStatusOk: (params: WaiterConfiguration<EC2Client>, input: DescribeInstanceStatusCommandInput) => Promise<WaiterResult>;
