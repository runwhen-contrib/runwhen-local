import { createPaginator } from "@smithy/core";
import { DescribeGlobalClustersCommand, } from "../commands/DescribeGlobalClustersCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeGlobalClusters = createPaginator(RDSClient, DescribeGlobalClustersCommand, "Marker", "Marker", "MaxRecords");
