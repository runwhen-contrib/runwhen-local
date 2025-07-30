import { createPaginator } from "@smithy/core";
import { DescribeSpotInstanceRequestsCommand, } from "../commands/DescribeSpotInstanceRequestsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSpotInstanceRequests = createPaginator(EC2Client, DescribeSpotInstanceRequestsCommand, "NextToken", "NextToken", "MaxResults");
