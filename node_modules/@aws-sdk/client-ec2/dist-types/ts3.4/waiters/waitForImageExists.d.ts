import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeImagesCommandInput } from "../commands/DescribeImagesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForImageExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeImagesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilImageExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeImagesCommandInput
) => Promise<WaiterResult>;
