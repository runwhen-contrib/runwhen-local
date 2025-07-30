import { createPaginator } from "@smithy/core";
import { DescribeAddressTransfersCommand, } from "../commands/DescribeAddressTransfersCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeAddressTransfers = createPaginator(EC2Client, DescribeAddressTransfersCommand, "NextToken", "NextToken", "MaxResults");
