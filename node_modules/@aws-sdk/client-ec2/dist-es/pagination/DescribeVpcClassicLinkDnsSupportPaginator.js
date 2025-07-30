import { createPaginator } from "@smithy/core";
import { DescribeVpcClassicLinkDnsSupportCommand, } from "../commands/DescribeVpcClassicLinkDnsSupportCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcClassicLinkDnsSupport = createPaginator(EC2Client, DescribeVpcClassicLinkDnsSupportCommand, "NextToken", "NextToken", "MaxResults");
