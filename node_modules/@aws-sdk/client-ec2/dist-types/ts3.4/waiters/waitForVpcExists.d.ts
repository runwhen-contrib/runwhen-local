import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpcsCommandInput } from "../commands/DescribeVpcsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVpcExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVpcExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcsCommandInput
) => Promise<WaiterResult>;
