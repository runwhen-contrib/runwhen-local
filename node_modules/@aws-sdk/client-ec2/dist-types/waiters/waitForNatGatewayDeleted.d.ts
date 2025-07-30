import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeNatGatewaysCommandInput } from "../commands/DescribeNatGatewaysCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilNatGatewayDeleted instead. waitForNatGatewayDeleted does not throw error in non-success cases.
 */
export declare const waitForNatGatewayDeleted: (params: WaiterConfiguration<EC2Client>, input: DescribeNatGatewaysCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeNatGatewaysCommand for polling.
 */
export declare const waitUntilNatGatewayDeleted: (params: WaiterConfiguration<EC2Client>, input: DescribeNatGatewaysCommandInput) => Promise<WaiterResult>;
