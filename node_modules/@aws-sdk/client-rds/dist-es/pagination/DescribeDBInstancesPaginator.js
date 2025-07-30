import { createPaginator } from "@smithy/core";
import { DescribeDBInstancesCommand, } from "../commands/DescribeDBInstancesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBInstances = createPaginator(RDSClient, DescribeDBInstancesCommand, "Marker", "Marker", "MaxRecords");
