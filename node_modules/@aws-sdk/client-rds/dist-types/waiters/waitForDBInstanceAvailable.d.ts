import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBInstancesCommandInput } from "../commands/DescribeDBInstancesCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilDBInstanceAvailable instead. waitForDBInstanceAvailable does not throw error in non-success cases.
 */
export declare const waitForDBInstanceAvailable: (params: WaiterConfiguration<RDSClient>, input: DescribeDBInstancesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeDBInstancesCommand for polling.
 */
export declare const waitUntilDBInstanceAvailable: (params: WaiterConfiguration<RDSClient>, input: DescribeDBInstancesCommandInput) => Promise<WaiterResult>;
