import { createPaginator } from "@smithy/core";
import { DescribeFpgaImagesCommand, } from "../commands/DescribeFpgaImagesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeFpgaImages = createPaginator(EC2Client, DescribeFpgaImagesCommand, "NextToken", "NextToken", "MaxResults");
