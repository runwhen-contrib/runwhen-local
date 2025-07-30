import { createPaginator } from "@smithy/core";
import { DescribeNetworkInsightsAccessScopesCommand, } from "../commands/DescribeNetworkInsightsAccessScopesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkInsightsAccessScopes = createPaginator(EC2Client, DescribeNetworkInsightsAccessScopesCommand, "NextToken", "NextToken", "MaxResults");
