import { createPaginator } from "@smithy/core";
import { DescribeVpcsCommand, } from "../commands/DescribeVpcsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcs = createPaginator(EC2Client, DescribeVpcsCommand, "NextToken", "NextToken", "MaxResults");
