import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeKeyPairsCommandInput } from "../commands/DescribeKeyPairsCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilKeyPairExists instead. waitForKeyPairExists does not throw error in non-success cases.
 */
export declare const waitForKeyPairExists: (params: WaiterConfiguration<EC2Client>, input: DescribeKeyPairsCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeKeyPairsCommand for polling.
 */
export declare const waitUntilKeyPairExists: (params: WaiterConfiguration<EC2Client>, input: DescribeKeyPairsCommandInput) => Promise<WaiterResult>;
