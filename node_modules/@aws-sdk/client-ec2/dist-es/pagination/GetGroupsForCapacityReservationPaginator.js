import { createPaginator } from "@smithy/core";
import { GetGroupsForCapacityReservationCommand, } from "../commands/GetGroupsForCapacityReservationCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetGroupsForCapacityReservation = createPaginator(EC2Client, GetGroupsForCapacityReservationCommand, "NextToken", "NextToken", "MaxResults");
