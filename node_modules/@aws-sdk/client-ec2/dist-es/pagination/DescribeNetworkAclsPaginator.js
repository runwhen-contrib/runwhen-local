import { createPaginator } from "@smithy/core";
import { DescribeNetworkAclsCommand, } from "../commands/DescribeNetworkAclsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkAcls = createPaginator(EC2Client, DescribeNetworkAclsCommand, "NextToken", "NextToken", "MaxResults");
