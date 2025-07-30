import { createPaginator } from "@smithy/core";
import { DescribeHostReservationsCommand, } from "../commands/DescribeHostReservationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeHostReservations = createPaginator(EC2Client, DescribeHostReservationsCommand, "NextToken", "NextToken", "MaxResults");
