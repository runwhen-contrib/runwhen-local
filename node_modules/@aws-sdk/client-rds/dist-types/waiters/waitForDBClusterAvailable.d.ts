import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBClustersCommandInput } from "../commands/DescribeDBClustersCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilDBClusterAvailable instead. waitForDBClusterAvailable does not throw error in non-success cases.
 */
export declare const waitForDBClusterAvailable: (params: WaiterConfiguration<RDSClient>, input: DescribeDBClustersCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeDBClustersCommand for polling.
 */
export declare const waitUntilDBClusterAvailable: (params: WaiterConfiguration<RDSClient>, input: DescribeDBClustersCommandInput) => Promise<WaiterResult>;
