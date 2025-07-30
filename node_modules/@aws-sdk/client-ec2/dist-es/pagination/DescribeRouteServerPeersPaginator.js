import { createPaginator } from "@smithy/core";
import { DescribeRouteServerPeersCommand, } from "../commands/DescribeRouteServerPeersCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeRouteServerPeers = createPaginator(EC2Client, DescribeRouteServerPeersCommand, "NextToken", "NextToken", "MaxResults");
