import { createPaginator } from "@smithy/core";
import { DescribeOptionGroupsCommand, } from "../commands/DescribeOptionGroupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeOptionGroups = createPaginator(RDSClient, DescribeOptionGroupsCommand, "Marker", "Marker", "MaxRecords");
