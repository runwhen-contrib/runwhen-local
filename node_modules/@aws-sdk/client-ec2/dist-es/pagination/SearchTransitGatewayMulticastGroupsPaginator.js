import { createPaginator } from "@smithy/core";
import { SearchTransitGatewayMulticastGroupsCommand, } from "../commands/SearchTransitGatewayMulticastGroupsCommand";
import { EC2Client } from "../EC2Client";
export const paginateSearchTransitGatewayMulticastGroups = createPaginator(EC2Client, SearchTransitGatewayMulticastGroupsCommand, "NextToken", "NextToken", "MaxResults");
