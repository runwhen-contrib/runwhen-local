import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeNatGatewaysCommandInput } from "../commands/DescribeNatGatewaysCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilNatGatewayAvailable instead. waitForNatGatewayAvailable does not throw error in non-success cases.
 */
export declare const waitForNatGatewayAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeNatGatewaysCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeNatGatewaysCommand for polling.
 */
export declare const waitUntilNatGatewayAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeNatGatewaysCommandInput) => Promise<WaiterResult>;
