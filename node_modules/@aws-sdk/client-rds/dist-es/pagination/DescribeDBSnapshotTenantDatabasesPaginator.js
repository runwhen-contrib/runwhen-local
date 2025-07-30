import { createPaginator } from "@smithy/core";
import { DescribeDBSnapshotTenantDatabasesCommand, } from "../commands/DescribeDBSnapshotTenantDatabasesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBSnapshotTenantDatabases = createPaginator(RDSClient, DescribeDBSnapshotTenantDatabasesCommand, "Marker", "Marker", "MaxRecords");
