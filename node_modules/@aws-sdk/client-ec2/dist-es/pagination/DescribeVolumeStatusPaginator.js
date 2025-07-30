import { createPaginator } from "@smithy/core";
import { DescribeVolumeStatusCommand, } from "../commands/DescribeVolumeStatusCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVolumeStatus = createPaginator(EC2Client, DescribeVolumeStatusCommand, "NextToken", "NextToken", "MaxResults");
