import { createPaginator } from "@smithy/core";
import { DescribeDBClusterAutomatedBackupsCommand, } from "../commands/DescribeDBClusterAutomatedBackupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusterAutomatedBackups = createPaginator(RDSClient, DescribeDBClusterAutomatedBackupsCommand, "Marker", "Marker", "MaxRecords");
