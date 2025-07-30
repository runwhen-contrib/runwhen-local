import { createPaginator } from "@smithy/core";
import { DescribeClientVpnTargetNetworksCommand, } from "../commands/DescribeClientVpnTargetNetworksCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeClientVpnTargetNetworks = createPaginator(EC2Client, DescribeClientVpnTargetNetworksCommand, "NextToken", "NextToken", "MaxResults");
