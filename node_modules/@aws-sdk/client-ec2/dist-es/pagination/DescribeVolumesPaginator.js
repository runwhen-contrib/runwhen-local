import { createPaginator } from "@smithy/core";
import { DescribeVolumesCommand, } from "../commands/DescribeVolumesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVolumes = createPaginator(EC2Client, DescribeVolumesCommand, "NextToken", "NextToken", "MaxResults");
