import { createPaginator } from "@smithy/core";
import { DescribeInstancesCommand, } from "../commands/DescribeInstancesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstances = createPaginator(EC2Client, DescribeInstancesCommand, "NextToken", "NextToken", "MaxResults");
