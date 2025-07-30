import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeKeyPairsCommandInput } from "../commands/DescribeKeyPairsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForKeyPairExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeKeyPairsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilKeyPairExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeKeyPairsCommandInput
) => Promise<WaiterResult>;
