import { createPaginator } from "@smithy/core";
import { DescribeInstanceTopologyCommand, } from "../commands/DescribeInstanceTopologyCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceTopology = createPaginator(EC2Client, DescribeInstanceTopologyCommand, "NextToken", "NextToken", "MaxResults");
