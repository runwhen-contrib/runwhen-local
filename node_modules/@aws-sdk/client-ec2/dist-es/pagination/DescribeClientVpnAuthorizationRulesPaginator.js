import { createPaginator } from "@smithy/core";
import { DescribeClientVpnAuthorizationRulesCommand, } from "../commands/DescribeClientVpnAuthorizationRulesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeClientVpnAuthorizationRules = createPaginator(EC2Client, DescribeClientVpnAuthorizationRulesCommand, "NextToken", "NextToken", "MaxResults");
