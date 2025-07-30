import { createPaginator } from "@smithy/core";
import { DescribeIpamPoolsCommand, } from "../commands/DescribeIpamPoolsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIpamPools = createPaginator(EC2Client, DescribeIpamPoolsCommand, "NextToken", "NextToken", "MaxResults");
