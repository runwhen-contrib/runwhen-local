import { createPaginator } from "@smithy/core";
import { DescribeTagsCommand, } from "../commands/DescribeTagsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTags = createPaginator(EC2Client, DescribeTagsCommand, "NextToken", "NextToken", "MaxResults");
