import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForInstanceRunning: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilInstanceRunning: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
