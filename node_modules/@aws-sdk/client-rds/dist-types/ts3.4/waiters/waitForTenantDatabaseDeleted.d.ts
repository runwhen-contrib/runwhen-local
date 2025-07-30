import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeTenantDatabasesCommandInput } from "../commands/DescribeTenantDatabasesCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForTenantDatabaseDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeTenantDatabasesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilTenantDatabaseDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeTenantDatabasesCommandInput
) => Promise<WaiterResult>;
