import { createPaginator } from "@smithy/core";
import { DescribeRouteServersCommand, } from "../commands/DescribeRouteServersCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeRouteServers = createPaginator(EC2Client, DescribeRouteServersCommand, "NextToken", "NextToken", "MaxResults");
