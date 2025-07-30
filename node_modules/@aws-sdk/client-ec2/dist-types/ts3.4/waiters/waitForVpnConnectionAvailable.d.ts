import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpnConnectionsCommandInput } from "../commands/DescribeVpnConnectionsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVpnConnectionAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpnConnectionsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVpnConnectionAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpnConnectionsCommandInput
) => Promise<WaiterResult>;
