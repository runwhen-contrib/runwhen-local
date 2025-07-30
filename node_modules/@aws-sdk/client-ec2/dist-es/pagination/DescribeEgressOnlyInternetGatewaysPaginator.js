import { createPaginator } from "@smithy/core";
import { DescribeEgressOnlyInternetGatewaysCommand, } from "../commands/DescribeEgressOnlyInternetGatewaysCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeEgressOnlyInternetGateways = createPaginator(EC2Client, DescribeEgressOnlyInternetGatewaysCommand, "NextToken", "NextToken", "MaxResults");
