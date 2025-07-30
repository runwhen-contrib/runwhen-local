import { createPaginator } from "@smithy/core";
import { DescribeLocalGatewaysCommand, } from "../commands/DescribeLocalGatewaysCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLocalGateways = createPaginator(EC2Client, DescribeLocalGatewaysCommand, "NextToken", "NextToken", "MaxResults");
