import { createPaginator } from "@smithy/core";
import { DescribeNetworkInsightsPathsCommand, } from "../commands/DescribeNetworkInsightsPathsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkInsightsPaths = createPaginator(EC2Client, DescribeNetworkInsightsPathsCommand, "NextToken", "NextToken", "MaxResults");
