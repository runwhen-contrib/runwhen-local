import { createPaginator } from "@smithy/core";
import { GetIpamDiscoveredAccountsCommand, } from "../commands/GetIpamDiscoveredAccountsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetIpamDiscoveredAccounts = createPaginator(EC2Client, GetIpamDiscoveredAccountsCommand, "NextToken", "NextToken", "MaxResults");
