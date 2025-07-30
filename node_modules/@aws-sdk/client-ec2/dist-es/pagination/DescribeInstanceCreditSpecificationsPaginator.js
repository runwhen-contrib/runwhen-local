import { createPaginator } from "@smithy/core";
import { DescribeInstanceCreditSpecificationsCommand, } from "../commands/DescribeInstanceCreditSpecificationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceCreditSpecifications = createPaginator(EC2Client, DescribeInstanceCreditSpecificationsCommand, "NextToken", "NextToken", "MaxResults");
