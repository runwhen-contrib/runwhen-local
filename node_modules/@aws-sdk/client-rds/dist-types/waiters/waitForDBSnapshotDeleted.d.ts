import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBSnapshotsCommandInput } from "../commands/DescribeDBSnapshotsCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilDBSnapshotDeleted instead. waitForDBSnapshotDeleted does not throw error in non-success cases.
 */
export declare const waitForDBSnapshotDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeDBSnapshotsCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeDBSnapshotsCommand for polling.
 */
export declare const waitUntilDBSnapshotDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeDBSnapshotsCommandInput) => Promise<WaiterResult>;
