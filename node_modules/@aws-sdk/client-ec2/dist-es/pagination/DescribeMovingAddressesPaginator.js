import { createPaginator } from "@smithy/core";
import { DescribeMovingAddressesCommand, } from "../commands/DescribeMovingAddressesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeMovingAddresses = createPaginator(EC2Client, DescribeMovingAddressesCommand, "NextToken", "NextToken", "MaxResults");
