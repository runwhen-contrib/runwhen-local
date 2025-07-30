import { createPaginator } from "@smithy/core";
import { DescribeDBSubnetGroupsCommand, } from "../commands/DescribeDBSubnetGroupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBSubnetGroups = createPaginator(RDSClient, DescribeDBSubnetGroupsCommand, "Marker", "Marker", "MaxRecords");
