import { createPaginator } from "@smithy/core";
import { DescribeIpamScopesCommand, } from "../commands/DescribeIpamScopesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIpamScopes = createPaginator(EC2Client, DescribeIpamScopesCommand, "NextToken", "NextToken", "MaxResults");
