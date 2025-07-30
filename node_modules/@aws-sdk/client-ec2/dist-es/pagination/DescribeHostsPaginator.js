import { createPaginator } from "@smithy/core";
import { DescribeHostsCommand, } from "../commands/DescribeHostsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeHosts = createPaginator(EC2Client, DescribeHostsCommand, "NextToken", "NextToken", "MaxResults");
