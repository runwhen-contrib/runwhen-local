import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeTenantDatabasesCommandInput } from "../commands/DescribeTenantDatabasesCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilTenantDatabaseAvailable instead. waitForTenantDatabaseAvailable does not throw error in non-success cases.
 */
export declare const waitForTenantDatabaseAvailable: (params: WaiterConfiguration<RDSClient>, input: DescribeTenantDatabasesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeTenantDatabasesCommand for polling.
 */
export declare const waitUntilTenantDatabaseAvailable: (params: WaiterConfiguration<RDSClient>, input: DescribeTenantDatabasesCommandInput) => Promise<WaiterResult>;
