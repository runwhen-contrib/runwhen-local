import { createPaginator } from "@smithy/core";
import { DescribeInstanceTypesCommand, } from "../commands/DescribeInstanceTypesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceTypes = createPaginator(EC2Client, DescribeInstanceTypesCommand, "NextToken", "NextToken", "MaxResults");
