import { createPaginator } from "@smithy/core";
import { DescribeInternetGatewaysCommand, } from "../commands/DescribeInternetGatewaysCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInternetGateways = createPaginator(EC2Client, DescribeInternetGatewaysCommand, "NextToken", "NextToken", "MaxResults");
