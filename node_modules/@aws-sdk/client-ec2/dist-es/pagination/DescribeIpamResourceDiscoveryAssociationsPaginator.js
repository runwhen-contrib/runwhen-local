import { createPaginator } from "@smithy/core";
import { DescribeIpamResourceDiscoveryAssociationsCommand, } from "../commands/DescribeIpamResourceDiscoveryAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIpamResourceDiscoveryAssociations = createPaginator(EC2Client, DescribeIpamResourceDiscoveryAssociationsCommand, "NextToken", "NextToken", "MaxResults");
