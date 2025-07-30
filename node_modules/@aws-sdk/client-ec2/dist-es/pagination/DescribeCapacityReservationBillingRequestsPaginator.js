import { createPaginator } from "@smithy/core";
import { DescribeCapacityReservationBillingRequestsCommand, } from "../commands/DescribeCapacityReservationBillingRequestsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCapacityReservationBillingRequests = createPaginator(EC2Client, DescribeCapacityReservationBillingRequestsCommand, "NextToken", "NextToken", "MaxResults");
