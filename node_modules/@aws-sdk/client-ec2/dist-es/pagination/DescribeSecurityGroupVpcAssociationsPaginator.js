import { createPaginator } from "@smithy/core";
import { DescribeSecurityGroupVpcAssociationsCommand, } from "../commands/DescribeSecurityGroupVpcAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSecurityGroupVpcAssociations = createPaginator(EC2Client, DescribeSecurityGroupVpcAssociationsCommand, "NextToken", "NextToken", "MaxResults");
