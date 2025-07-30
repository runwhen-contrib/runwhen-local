import { createPaginator } from "@smithy/core";
import { DescribeDBProxyEndpointsCommand, } from "../commands/DescribeDBProxyEndpointsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBProxyEndpoints = createPaginator(RDSClient, DescribeDBProxyEndpointsCommand, "Marker", "Marker", "MaxRecords");
