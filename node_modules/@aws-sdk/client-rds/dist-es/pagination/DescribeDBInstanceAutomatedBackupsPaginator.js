import { createPaginator } from "@smithy/core";
import { DescribeDBInstanceAutomatedBackupsCommand, } from "../commands/DescribeDBInstanceAutomatedBackupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBInstanceAutomatedBackups = createPaginator(RDSClient, DescribeDBInstanceAutomatedBackupsCommand, "Marker", "Marker", "MaxRecords");
