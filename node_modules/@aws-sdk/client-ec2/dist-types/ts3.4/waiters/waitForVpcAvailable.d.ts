import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpcsCommandInput } from "../commands/DescribeVpcsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVpcAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVpcAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcsCommandInput
) => Promise<WaiterResult>;
