import { createPaginator } from "@smithy/core";
import { DescribeReservedDBInstancesCommand, } from "../commands/DescribeReservedDBInstancesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeReservedDBInstances = createPaginator(RDSClient, DescribeReservedDBInstancesCommand, "Marker", "Marker", "MaxRecords");
