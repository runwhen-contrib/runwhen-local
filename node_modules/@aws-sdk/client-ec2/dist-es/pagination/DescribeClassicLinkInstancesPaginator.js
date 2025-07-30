import { createPaginator } from "@smithy/core";
import { DescribeClassicLinkInstancesCommand, } from "../commands/DescribeClassicLinkInstancesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeClassicLinkInstances = createPaginator(EC2Client, DescribeClassicLinkInstancesCommand, "NextToken", "NextToken", "MaxResults");
