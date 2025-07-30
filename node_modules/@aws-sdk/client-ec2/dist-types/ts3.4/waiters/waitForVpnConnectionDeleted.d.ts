import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpnConnectionsCommandInput } from "../commands/DescribeVpnConnectionsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVpnConnectionDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpnConnectionsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVpnConnectionDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpnConnectionsCommandInput
) => Promise<WaiterResult>;
