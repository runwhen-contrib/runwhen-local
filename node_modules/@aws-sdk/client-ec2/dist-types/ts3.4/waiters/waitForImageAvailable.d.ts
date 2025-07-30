import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeImagesCommandInput } from "../commands/DescribeImagesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForImageAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeImagesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilImageAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeImagesCommandInput
) => Promise<WaiterResult>;
