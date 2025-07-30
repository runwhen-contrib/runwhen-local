import { createPaginator } from "@smithy/core";
import { DescribeFleetsCommand, } from "../commands/DescribeFleetsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeFleets = createPaginator(EC2Client, DescribeFleetsCommand, "NextToken", "NextToken", "MaxResults");
