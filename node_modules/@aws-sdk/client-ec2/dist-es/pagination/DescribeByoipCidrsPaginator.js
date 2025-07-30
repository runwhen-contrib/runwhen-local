import { createPaginator } from "@smithy/core";
import { DescribeByoipCidrsCommand, } from "../commands/DescribeByoipCidrsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeByoipCidrs = createPaginator(EC2Client, DescribeByoipCidrsCommand, "NextToken", "NextToken", "MaxResults");
