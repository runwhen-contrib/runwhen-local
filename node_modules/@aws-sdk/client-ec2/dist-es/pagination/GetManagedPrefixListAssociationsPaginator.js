import { createPaginator } from "@smithy/core";
import { GetManagedPrefixListAssociationsCommand, } from "../commands/GetManagedPrefixListAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetManagedPrefixListAssociations = createPaginator(EC2Client, GetManagedPrefixListAssociationsCommand, "NextToken", "NextToken", "MaxResults");
