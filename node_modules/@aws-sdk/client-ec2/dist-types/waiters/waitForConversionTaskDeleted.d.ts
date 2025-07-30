import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeConversionTasksCommandInput } from "../commands/DescribeConversionTasksCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilConversionTaskDeleted instead. waitForConversionTaskDeleted does not throw error in non-success cases.
 */
export declare const waitForConversionTaskDeleted: (params: WaiterConfiguration<EC2Client>, input: DescribeConversionTasksCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeConversionTasksCommand for polling.
 */
export declare const waitUntilConversionTaskDeleted: (params: WaiterConfiguration<EC2Client>, input: DescribeConversionTasksCommandInput) => Promise<WaiterResult>;
