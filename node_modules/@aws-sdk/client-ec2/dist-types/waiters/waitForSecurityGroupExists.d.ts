import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeSecurityGroupsCommandInput } from "../commands/DescribeSecurityGroupsCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilSecurityGroupExists instead. waitForSecurityGroupExists does not throw error in non-success cases.
 */
export declare const waitForSecurityGroupExists: (params: WaiterConfiguration<EC2Client>, input: DescribeSecurityGroupsCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeSecurityGroupsCommand for polling.
 */
export declare const waitUntilSecurityGroupExists: (params: WaiterConfiguration<EC2Client>, input: DescribeSecurityGroupsCommandInput) => Promise<WaiterResult>;
