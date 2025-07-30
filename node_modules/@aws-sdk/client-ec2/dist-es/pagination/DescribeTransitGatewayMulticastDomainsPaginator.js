import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayMulticastDomainsCommand, } from "../commands/DescribeTransitGatewayMulticastDomainsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayMulticastDomains = createPaginator(EC2Client, DescribeTransitGatewayMulticastDomainsCommand, "NextToken", "NextToken", "MaxResults");
