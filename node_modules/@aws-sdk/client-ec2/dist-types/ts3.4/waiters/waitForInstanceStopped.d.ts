import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForInstanceStopped: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilInstanceStopped: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
