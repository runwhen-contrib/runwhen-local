import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstancesCommandInput } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForInstanceExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilInstanceExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstancesCommandInput
) => Promise<WaiterResult>;
