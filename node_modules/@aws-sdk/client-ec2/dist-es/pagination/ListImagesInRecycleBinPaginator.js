import { createPaginator } from "@smithy/core";
import { ListImagesInRecycleBinCommand, } from "../commands/ListImagesInRecycleBinCommand";
import { EC2Client } from "../EC2Client";
export const paginateListImagesInRecycleBin = createPaginator(EC2Client, ListImagesInRecycleBinCommand, "NextToken", "NextToken", "MaxResults");
