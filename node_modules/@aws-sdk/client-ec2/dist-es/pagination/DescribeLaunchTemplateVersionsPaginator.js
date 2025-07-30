import { createPaginator } from "@smithy/core";
import { DescribeLaunchTemplateVersionsCommand, } from "../commands/DescribeLaunchTemplateVersionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLaunchTemplateVersions = createPaginator(EC2Client, DescribeLaunchTemplateVersionsCommand, "NextToken", "NextToken", "MaxResults");
