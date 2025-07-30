import { Paginator } from "@smithy/types";
import {
  DescribeNetworkInsightsAccessScopesCommandInput,
  DescribeNetworkInsightsAccessScopesCommandOutput,
} from "../commands/DescribeNetworkInsightsAccessScopesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeNetworkInsightsAccessScopes: (
  config: EC2PaginationConfiguration,
  input: DescribeNetworkInsightsAccessScopesCommandInput,
  ...rest: any[]
) => Paginator<DescribeNetworkInsightsAccessScopesCommandOutput>;
