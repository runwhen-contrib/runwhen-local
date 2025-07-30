import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeTenantDatabasesCommandInput } from "../commands/DescribeTenantDatabasesCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForTenantDatabaseAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeTenantDatabasesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilTenantDatabaseAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeTenantDatabasesCommandInput
) => Promise<WaiterResult>;
