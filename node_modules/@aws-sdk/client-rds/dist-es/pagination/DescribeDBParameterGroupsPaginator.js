import { createPaginator } from "@smithy/core";
import { DescribeDBParameterGroupsCommand, } from "../commands/DescribeDBParameterGroupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBParameterGroups = createPaginator(RDSClient, DescribeDBParameterGroupsCommand, "Marker", "Marker", "MaxRecords");
