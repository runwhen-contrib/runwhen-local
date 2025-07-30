import { createPaginator } from "@smithy/core";
import { DescribeCoipPoolsCommand, } from "../commands/DescribeCoipPoolsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCoipPools = createPaginator(EC2Client, DescribeCoipPoolsCommand, "NextToken", "NextToken", "MaxResults");
