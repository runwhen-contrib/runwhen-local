import { Paginator } from "@smithy/types";
import {
  GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput,
  GetNetworkInsightsAccessScopeAnalysisFindingsCommandOutput,
} from "../commands/GetNetworkInsightsAccessScopeAnalysisFindingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetNetworkInsightsAccessScopeAnalysisFindings: (
  config: EC2PaginationConfiguration,
  input: GetNetworkInsightsAccessScopeAnalysisFindingsCommandInput,
  ...rest: any[]
) => Paginator<GetNetworkInsightsAccessScopeAnalysisFindingsCommandOutput>;
