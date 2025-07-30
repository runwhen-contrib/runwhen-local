import { createPaginator } from "@smithy/core";
import { DescribeManagedPrefixListsCommand, } from "../commands/DescribeManagedPrefixListsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeManagedPrefixLists = createPaginator(EC2Client, DescribeManagedPrefixListsCommand, "NextToken", "NextToken", "MaxResults");
