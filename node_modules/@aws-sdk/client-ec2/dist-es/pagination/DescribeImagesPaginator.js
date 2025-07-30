import { createPaginator } from "@smithy/core";
import { DescribeImagesCommand, } from "../commands/DescribeImagesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeImages = createPaginator(EC2Client, DescribeImagesCommand, "NextToken", "NextToken", "MaxResults");
