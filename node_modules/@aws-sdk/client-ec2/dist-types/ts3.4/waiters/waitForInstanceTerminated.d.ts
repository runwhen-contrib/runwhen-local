import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForInstanceTerminated: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilInstanceTerminated: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
