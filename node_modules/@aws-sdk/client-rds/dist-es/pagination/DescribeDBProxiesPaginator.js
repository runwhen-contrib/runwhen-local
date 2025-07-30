import { createPaginator } from "@smithy/core";
import { DescribeDBProxiesCommand, } from "../commands/DescribeDBProxiesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBProxies = createPaginator(RDSClient, DescribeDBProxiesCommand, "Marker", "Marker", "MaxRecords");
