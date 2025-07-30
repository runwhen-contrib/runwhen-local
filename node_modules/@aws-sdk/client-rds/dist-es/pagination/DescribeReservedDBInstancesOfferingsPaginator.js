import { createPaginator } from "@smithy/core";
import { DescribeReservedDBInstancesOfferingsCommand, } from "../commands/DescribeReservedDBInstancesOfferingsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeReservedDBInstancesOfferings = createPaginator(RDSClient, DescribeReservedDBInstancesOfferingsCommand, "Marker", "Marker", "MaxRecords");
