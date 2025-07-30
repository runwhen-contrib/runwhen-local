import { createPaginator } from "@smithy/core";
import { DescribeScheduledInstancesCommand, } from "../commands/DescribeScheduledInstancesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeScheduledInstances = createPaginator(EC2Client, DescribeScheduledInstancesCommand, "NextToken", "NextToken", "MaxResults");
