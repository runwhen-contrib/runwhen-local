import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBInstancesCommandInput } from "../commands/DescribeDBInstancesCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilDBInstanceDeleted instead. waitForDBInstanceDeleted does not throw error in non-success cases.
 */
export declare const waitForDBInstanceDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeDBInstancesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeDBInstancesCommand for polling.
 */
export declare const waitUntilDBInstanceDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeDBInstancesCommandInput) => Promise<WaiterResult>;
