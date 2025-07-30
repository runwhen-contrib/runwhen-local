import { createPaginator } from "@smithy/core";
import { DescribeSecurityGroupRulesCommand, } from "../commands/DescribeSecurityGroupRulesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSecurityGroupRules = createPaginator(EC2Client, DescribeSecurityGroupRulesCommand, "NextToken", "NextToken", "MaxResults");
