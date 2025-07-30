import { createPaginator } from "@smithy/core";
import { DescribeFastLaunchImagesCommand, } from "../commands/DescribeFastLaunchImagesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeFastLaunchImages = createPaginator(EC2Client, DescribeFastLaunchImagesCommand, "NextToken", "NextToken", "MaxResults");
