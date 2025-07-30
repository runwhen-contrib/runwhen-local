import { createPaginator } from "@smithy/core";
import { DescribeInstanceImageMetadataCommand, } from "../commands/DescribeInstanceImageMetadataCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceImageMetadata = createPaginator(EC2Client, DescribeInstanceImageMetadataCommand, "NextToken", "NextToken", "MaxResults");
