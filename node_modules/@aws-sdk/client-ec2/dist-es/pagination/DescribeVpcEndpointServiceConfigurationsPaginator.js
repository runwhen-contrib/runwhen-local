import { createPaginator } from "@smithy/core";
import { DescribeVpcEndpointServiceConfigurationsCommand, } from "../commands/DescribeVpcEndpointServiceConfigurationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcEndpointServiceConfigurations = createPaginator(EC2Client, DescribeVpcEndpointServiceConfigurationsCommand, "NextToken", "NextToken", "MaxResults");
