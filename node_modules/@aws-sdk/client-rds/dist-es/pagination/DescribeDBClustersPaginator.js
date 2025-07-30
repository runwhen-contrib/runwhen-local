import { createPaginator } from "@smithy/core";
import { DescribeDBClustersCommand, } from "../commands/DescribeDBClustersCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusters = createPaginator(RDSClient, DescribeDBClustersCommand, "Marker", "Marker", "MaxRecords");
