import { createPaginator } from "@smithy/core";
import { DescribeInstanceStatusCommand, } from "../commands/DescribeInstanceStatusCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceStatus = createPaginator(EC2Client, DescribeInstanceStatusCommand, "NextToken", "NextToken", "MaxResults");
