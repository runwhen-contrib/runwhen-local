import { createPaginator } from "@smithy/core";
import { DescribeCapacityReservationsCommand, } from "../commands/DescribeCapacityReservationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCapacityReservations = createPaginator(EC2Client, DescribeCapacityReservationsCommand, "NextToken", "NextToken", "MaxResults");
