import { createPaginator } from "@smithy/core";
import { DescribeLaunchTemplatesCommand, } from "../commands/DescribeLaunchTemplatesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLaunchTemplates = createPaginator(EC2Client, DescribeLaunchTemplatesCommand, "NextToken", "NextToken", "MaxResults");
