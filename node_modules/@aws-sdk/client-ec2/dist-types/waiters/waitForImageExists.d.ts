import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeImagesCommandInput } from "../commands/DescribeImagesCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilImageExists instead. waitForImageExists does not throw error in non-success cases.
 */
export declare const waitForImageExists: (params: WaiterConfiguration<EC2Client>, input: DescribeImagesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeImagesCommand for polling.
 */
export declare const waitUntilImageExists: (params: WaiterConfiguration<EC2Client>, input: DescribeImagesCommandInput) => Promise<WaiterResult>;
