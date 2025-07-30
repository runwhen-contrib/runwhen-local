import { createPaginator } from "@smithy/core";
import { DescribePrefixListsCommand, } from "../commands/DescribePrefixListsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribePrefixLists = createPaginator(EC2Client, DescribePrefixListsCommand, "NextToken", "NextToken", "MaxResults");
