import { createPaginator } from "@smithy/core";
import { DescribeIpamResourceDiscoveriesCommand, } from "../commands/DescribeIpamResourceDiscoveriesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIpamResourceDiscoveries = createPaginator(EC2Client, DescribeIpamResourceDiscoveriesCommand, "NextToken", "NextToken", "MaxResults");
