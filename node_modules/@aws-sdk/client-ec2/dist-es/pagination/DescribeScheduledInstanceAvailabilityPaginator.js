import { createPaginator } from "@smithy/core";
import { DescribeScheduledInstanceAvailabilityCommand, } from "../commands/DescribeScheduledInstanceAvailabilityCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeScheduledInstanceAvailability = createPaginator(EC2Client, DescribeScheduledInstanceAvailabilityCommand, "NextToken", "NextToken", "MaxResults");
