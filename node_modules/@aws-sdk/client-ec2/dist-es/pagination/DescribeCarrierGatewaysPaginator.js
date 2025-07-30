import { createPaginator } from "@smithy/core";
import { DescribeCarrierGatewaysCommand, } from "../commands/DescribeCarrierGatewaysCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCarrierGateways = createPaginator(EC2Client, DescribeCarrierGatewaysCommand, "NextToken", "NextToken", "MaxResults");
