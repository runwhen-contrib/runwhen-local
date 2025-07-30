import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeCustomerGatewaysCommandInput } from "../commands/DescribeCustomerGatewaysCommand";
import { EC2Client } from "../EC2Client";
/**
 *
 *  @deprecated Use waitUntilCustomerGatewayAvailable instead. waitForCustomerGatewayAvailable does not throw error in non-success cases.
 */
export declare const waitForCustomerGatewayAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeCustomerGatewaysCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeCustomerGatewaysCommand for polling.
 */
export declare const waitUntilCustomerGatewayAvailable: (params: WaiterConfiguration<EC2Client>, input: DescribeCustomerGatewaysCommandInput) => Promise<WaiterResult>;
