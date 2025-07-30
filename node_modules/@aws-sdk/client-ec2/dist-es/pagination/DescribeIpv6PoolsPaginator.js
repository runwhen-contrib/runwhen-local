import { createPaginator } from "@smithy/core";
import { DescribeIpv6PoolsCommand, } from "../commands/DescribeIpv6PoolsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIpv6Pools = createPaginator(EC2Client, DescribeIpv6PoolsCommand, "NextToken", "NextToken", "MaxResults");
