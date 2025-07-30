import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBClustersCommandInput } from "../commands/DescribeDBClustersCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilDBClusterDeleted instead. waitForDBClusterDeleted does not throw error in non-success cases.
 */
export declare const waitForDBClusterDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeDBClustersCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeDBClustersCommand for polling.
 */
export declare const waitUntilDBClusterDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeDBClustersCommandInput) => Promise<WaiterResult>;
