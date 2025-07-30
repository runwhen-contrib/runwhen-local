import { createPaginator } from "@smithy/core";
import { GetIpamDiscoveredResourceCidrsCommand, } from "../commands/GetIpamDiscoveredResourceCidrsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetIpamDiscoveredResourceCidrs = createPaginator(EC2Client, GetIpamDiscoveredResourceCidrsCommand, "NextToken", "NextToken", "MaxResults");
