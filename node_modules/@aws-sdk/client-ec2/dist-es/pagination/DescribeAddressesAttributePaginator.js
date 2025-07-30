import { createPaginator } from "@smithy/core";
import { DescribeAddressesAttributeCommand, } from "../commands/DescribeAddressesAttributeCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeAddressesAttribute = createPaginator(EC2Client, DescribeAddressesAttributeCommand, "NextToken", "NextToken", "MaxResults");
