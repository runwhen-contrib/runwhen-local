import { createPaginator } from "@smithy/core";
import { DescribeNatGatewaysCommand, } from "../commands/DescribeNatGatewaysCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNatGateways = createPaginator(EC2Client, DescribeNatGatewaysCommand, "NextToken", "NextToken", "MaxResults");
