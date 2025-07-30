import { createPaginator } from "@smithy/core";
import { GetManagedPrefixListEntriesCommand, } from "../commands/GetManagedPrefixListEntriesCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetManagedPrefixListEntries = createPaginator(EC2Client, GetManagedPrefixListEntriesCommand, "NextToken", "NextToken", "MaxResults");
