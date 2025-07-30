import { createPaginator } from "@smithy/core";
import { DescribeRouteTablesCommand, } from "../commands/DescribeRouteTablesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeRouteTables = createPaginator(EC2Client, DescribeRouteTablesCommand, "NextToken", "NextToken", "MaxResults");
