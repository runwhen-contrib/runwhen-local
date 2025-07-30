import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpnConnectionsCommandInput } from "../commands/DescribeVpnConnectionsCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilVpnConnectionAvailable instead. waitForVpnConnectionAvailable does not throw error in non-success cases.
 */
export declare const waitForVpnConnectionAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeVpnConnectionsCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeVpnConnectionsCommand for polling.
 */
export declare const waitUntilVpnConnectionAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeVpnConnectionsCommandInput) => Promise<WaiterResult>;
