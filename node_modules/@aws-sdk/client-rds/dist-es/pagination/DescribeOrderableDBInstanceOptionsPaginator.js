import { createPaginator } from "@smithy/core";
import { DescribeOrderableDBInstanceOptionsCommand, } from "../commands/DescribeOrderableDBInstanceOptionsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeOrderableDBInstanceOptions = createPaginator(RDSClient, DescribeOrderableDBInstanceOptionsCommand, "Marker", "Marker", "MaxRecords");
