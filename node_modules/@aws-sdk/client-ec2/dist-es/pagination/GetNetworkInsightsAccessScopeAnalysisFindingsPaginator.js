import { createPaginator } from "@smithy/core";
import { GetNetworkInsightsAccessScopeAnalysisFindingsCommand, } from "../commands/GetNetworkInsightsAccessScopeAnalysisFindingsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetNetworkInsightsAccessScopeAnalysisFindings = createPaginator(EC2Client, GetNetworkInsightsAccessScopeAnalysisFindingsCommand, "NextToken", "NextToken", "MaxResults");
