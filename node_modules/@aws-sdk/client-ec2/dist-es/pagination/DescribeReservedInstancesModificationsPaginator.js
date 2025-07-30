import { createPaginator } from "@smithy/core";
import { DescribeReservedInstancesModificationsCommand, } from "../commands/DescribeReservedInstancesModificationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeReservedInstancesModifications = createPaginator(EC2Client, DescribeReservedInstancesModificationsCommand, "NextToken", "NextToken", "");
