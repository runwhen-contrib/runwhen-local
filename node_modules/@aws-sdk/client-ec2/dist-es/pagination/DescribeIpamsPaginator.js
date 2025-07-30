import { createPaginator } from "@smithy/core";
import { DescribeIpamsCommand, } from "../commands/DescribeIpamsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIpams = createPaginator(EC2Client, DescribeIpamsCommand, "NextToken", "NextToken", "MaxResults");
