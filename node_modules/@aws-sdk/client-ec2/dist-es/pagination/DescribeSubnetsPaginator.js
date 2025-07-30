import { createPaginator } from "@smithy/core";
import { DescribeSubnetsCommand, } from "../commands/DescribeSubnetsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSubnets = createPaginator(EC2Client, DescribeSubnetsCommand, "NextToken", "NextToken", "MaxResults");
