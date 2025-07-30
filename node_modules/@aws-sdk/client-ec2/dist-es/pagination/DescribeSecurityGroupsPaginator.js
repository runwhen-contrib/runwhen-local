import { createPaginator } from "@smithy/core";
import { DescribeSecurityGroupsCommand, } from "../commands/DescribeSecurityGroupsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSecurityGroups = createPaginator(EC2Client, DescribeSecurityGroupsCommand, "NextToken", "NextToken", "MaxResults");
