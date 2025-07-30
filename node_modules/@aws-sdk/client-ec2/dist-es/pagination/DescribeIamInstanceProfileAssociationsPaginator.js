import { createPaginator } from "@smithy/core";
import { DescribeIamInstanceProfileAssociationsCommand, } from "../commands/DescribeIamInstanceProfileAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeIamInstanceProfileAssociations = createPaginator(EC2Client, DescribeIamInstanceProfileAssociationsCommand, "NextToken", "NextToken", "MaxResults");
