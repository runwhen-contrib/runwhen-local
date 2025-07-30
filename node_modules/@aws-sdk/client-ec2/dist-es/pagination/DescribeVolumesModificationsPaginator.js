import { createPaginator } from "@smithy/core";
import { DescribeVolumesModificationsCommand, } from "../commands/DescribeVolumesModificationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVolumesModifications = createPaginator(EC2Client, DescribeVolumesModificationsCommand, "NextToken", "NextToken", "MaxResults");
