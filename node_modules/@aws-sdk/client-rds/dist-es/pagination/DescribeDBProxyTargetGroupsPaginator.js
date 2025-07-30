import { createPaginator } from "@smithy/core";
import { DescribeDBProxyTargetGroupsCommand, } from "../commands/DescribeDBProxyTargetGroupsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBProxyTargetGroups = createPaginator(RDSClient, DescribeDBProxyTargetGroupsCommand, "Marker", "Marker", "MaxRecords");
