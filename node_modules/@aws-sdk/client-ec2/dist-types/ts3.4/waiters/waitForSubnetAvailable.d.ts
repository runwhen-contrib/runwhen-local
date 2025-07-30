import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeSubnetsCommandInput } from "../commands/DescribeSubnetsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForSubnetAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSubnetsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilSubnetAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSubnetsCommandInput
) => Promise<WaiterResult>;
