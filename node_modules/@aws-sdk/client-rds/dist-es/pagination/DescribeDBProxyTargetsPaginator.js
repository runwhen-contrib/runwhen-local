import { createPaginator } from "@smithy/core";
import { DescribeDBProxyTargetsCommand, } from "../commands/DescribeDBProxyTargetsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBProxyTargets = createPaginator(RDSClient, DescribeDBProxyTargetsCommand, "Marker", "Marker", "MaxRecords");
