import { createPaginator } from "@smithy/core";
import { DescribeDBClusterParameterGroupsCommand, } from "../commands/DescribeDBClusterParameterGroupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusterParameterGroups = createPaginator(RDSClient, DescribeDBClusterParameterGroupsCommand, "Marker", "Marker", "MaxRecords");
