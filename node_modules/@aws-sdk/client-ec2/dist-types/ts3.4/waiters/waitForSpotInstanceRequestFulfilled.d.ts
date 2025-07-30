import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeSpotInstanceRequestsCommandInput } from "../commands/DescribeSpotInstanceRequestsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForSpotInstanceRequestFulfilled: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSpotInstanceRequestsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilSpotInstanceRequestFulfilled: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSpotInstanceRequestsCommandInput
) => Promise<WaiterResult>;
