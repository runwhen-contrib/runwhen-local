import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpcsCommandInput } from "../commands/DescribeVpcsCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilVpcExists instead. waitForVpcExists does not throw error in non-success cases.
 */
export declare const waitForVpcExists: (params: WaiterConfiguration<EC2Client>, input: DescribeVpcsCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeVpcsCommand for polling.
 */
export declare const waitUntilVpcExists: (params: WaiterConfiguration<EC2Client>, input: DescribeVpcsCommandInput) => Promise<WaiterResult>;
