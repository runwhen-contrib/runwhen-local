import { createPaginator } from "@smithy/core";
import { DescribeVpcEndpointsCommand, } from "../commands/DescribeVpcEndpointsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcEndpoints = createPaginator(EC2Client, DescribeVpcEndpointsCommand, "NextToken", "NextToken", "MaxResults");
