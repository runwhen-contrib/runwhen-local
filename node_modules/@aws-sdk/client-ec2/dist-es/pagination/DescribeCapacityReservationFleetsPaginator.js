import { createPaginator } from "@smithy/core";
import { DescribeCapacityReservationFleetsCommand, } from "../commands/DescribeCapacityReservationFleetsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCapacityReservationFleets = createPaginator(EC2Client, DescribeCapacityReservationFleetsCommand, "NextToken", "NextToken", "MaxResults");
