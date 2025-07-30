import { createPaginator } from "@smithy/core";
import { DescribePublicIpv4PoolsCommand, } from "../commands/DescribePublicIpv4PoolsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribePublicIpv4Pools = createPaginator(EC2Client, DescribePublicIpv4PoolsCommand, "NextToken", "NextToken", "MaxResults");
