import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInstanceStatusCommandInput } from "../commands/DescribeInstanceStatusCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForSystemStatusOk: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstanceStatusCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilSystemStatusOk: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInstanceStatusCommandInput
) => Promise<WaiterResult>;
