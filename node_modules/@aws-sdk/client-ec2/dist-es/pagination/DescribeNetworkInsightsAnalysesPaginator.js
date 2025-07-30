import { createPaginator } from "@smithy/core";
import { DescribeNetworkInsightsAnalysesCommand, } from "../commands/DescribeNetworkInsightsAnalysesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkInsightsAnalyses = createPaginator(EC2Client, DescribeNetworkInsightsAnalysesCommand, "NextToken", "NextToken", "MaxResults");
