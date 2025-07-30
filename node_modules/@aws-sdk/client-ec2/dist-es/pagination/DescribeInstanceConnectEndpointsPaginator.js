import { createPaginator } from "@smithy/core";
import { DescribeInstanceConnectEndpointsCommand, } from "../commands/DescribeInstanceConnectEndpointsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceConnectEndpoints = createPaginator(EC2Client, DescribeInstanceConnectEndpointsCommand, "NextToken", "NextToken", "MaxResults");
