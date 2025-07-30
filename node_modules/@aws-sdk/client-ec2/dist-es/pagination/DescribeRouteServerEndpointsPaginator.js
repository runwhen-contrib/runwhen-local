import { createPaginator } from "@smithy/core";
import { DescribeRouteServerEndpointsCommand, } from "../commands/DescribeRouteServerEndpointsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeRouteServerEndpoints = createPaginator(EC2Client, DescribeRouteServerEndpointsCommand, "NextToken", "NextToken", "MaxResults");
