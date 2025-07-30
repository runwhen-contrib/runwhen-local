import { createPaginator } from "@smithy/core";
import { DescribeNetworkInsightsAccessScopeAnalysesCommand, } from "../commands/DescribeNetworkInsightsAccessScopeAnalysesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkInsightsAccessScopeAnalyses = createPaginator(EC2Client, DescribeNetworkInsightsAccessScopeAnalysesCommand, "NextToken", "NextToken", "MaxResults");
