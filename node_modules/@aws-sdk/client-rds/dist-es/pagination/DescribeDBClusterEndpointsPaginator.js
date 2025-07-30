import { createPaginator } from "@smithy/core";
import { DescribeDBClusterEndpointsCommand, } from "../commands/DescribeDBClusterEndpointsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusterEndpoints = createPaginator(RDSClient, DescribeDBClusterEndpointsCommand, "Marker", "Marker", "MaxRecords");
