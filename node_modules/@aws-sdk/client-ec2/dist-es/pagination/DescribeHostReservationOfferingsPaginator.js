import { createPaginator } from "@smithy/core";
import { DescribeHostReservationOfferingsCommand, } from "../commands/DescribeHostReservationOfferingsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeHostReservationOfferings = createPaginator(EC2Client, DescribeHostReservationOfferingsCommand, "NextToken", "NextToken", "MaxResults");
