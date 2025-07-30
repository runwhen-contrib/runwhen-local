import { createPaginator } from "@smithy/core";
import { DescribeDhcpOptionsCommand, } from "../commands/DescribeDhcpOptionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeDhcpOptions = createPaginator(EC2Client, DescribeDhcpOptionsCommand, "NextToken", "NextToken", "MaxResults");
