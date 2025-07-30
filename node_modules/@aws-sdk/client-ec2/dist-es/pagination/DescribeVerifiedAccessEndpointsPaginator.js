import { createPaginator } from "@smithy/core";
import { DescribeVerifiedAccessEndpointsCommand, } from "../commands/DescribeVerifiedAccessEndpointsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVerifiedAccessEndpoints = createPaginator(EC2Client, DescribeVerifiedAccessEndpointsCommand, "NextToken", "NextToken", "MaxResults");
