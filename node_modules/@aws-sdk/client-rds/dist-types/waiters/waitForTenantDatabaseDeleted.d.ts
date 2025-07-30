import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeTenantDatabasesCommandInput } from "../commands/DescribeTenantDatabasesCommand";
import { RDSClient } from "../RDSClient";
/**
 *
 *  @deprecated Use waitUntilTenantDatabaseDeleted instead. waitForTenantDatabaseDeleted does not throw error in non-success cases.
 */
export declare const waitForTenantDatabaseDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeTenantDatabasesCommandInput) => Promise<WaiterResult>;
/**
 *
 *  @param params - Waiter configuration options.
 *  @param input - The input to DescribeTenantDatabasesCommand for polling.
 */
export declare const waitUntilTenantDatabaseDeleted: (params: WaiterConfiguration<RDSClient>, input: DescribeTenantDatabasesCommandInput) => Promise<WaiterResult>;
