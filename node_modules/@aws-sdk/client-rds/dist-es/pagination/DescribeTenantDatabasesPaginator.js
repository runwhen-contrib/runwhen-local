import { createPaginator } from "@smithy/core";
import { DescribeTenantDatabasesCommand, } from "../commands/DescribeTenantDatabasesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeTenantDatabases = createPaginator(RDSClient, DescribeTenantDatabasesCommand, "Marker", "Marker", "MaxRecords");
