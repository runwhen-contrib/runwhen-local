import { createPaginator } from "@smithy/core";
import { DescribeDBSecurityGroupsCommand, } from "../commands/DescribeDBSecurityGroupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBSecurityGroups = createPaginator(RDSClient, DescribeDBSecurityGroupsCommand, "Marker", "Marker", "MaxRecords");
