import { createPaginator } from "@smithy/core";
import { DescribeLocalGatewayRouteTablesCommand, } from "../commands/DescribeLocalGatewayRouteTablesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLocalGatewayRouteTables = createPaginator(EC2Client, DescribeLocalGatewayRouteTablesCommand, "NextToken", "NextToken", "MaxResults");
