import { createPaginator } from "@smithy/core";
import { DescribeMacHostsCommand, } from "../commands/DescribeMacHostsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeMacHosts = createPaginator(EC2Client, DescribeMacHostsCommand, "NextToken", "NextToken", "MaxResults");
