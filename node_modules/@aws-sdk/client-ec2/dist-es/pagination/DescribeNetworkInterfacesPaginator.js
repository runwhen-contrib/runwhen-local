import { createPaginator } from "@smithy/core";
import { DescribeNetworkInterfacesCommand, } from "../commands/DescribeNetworkInterfacesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkInterfaces = createPaginator(EC2Client, DescribeNetworkInterfacesCommand, "NextToken", "NextToken", "MaxResults");
