import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeImagesCommandInput } from "../commands/DescribeImagesCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilImageAvailable instead. waitForImageAvailable does not throw error in non-success cases.
 */
export declare const waitForImageAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeImagesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeImagesCommand for polling.
 */
export declare const waitUntilImageAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeImagesCommandInput) => Promise<WaiterResult>;
