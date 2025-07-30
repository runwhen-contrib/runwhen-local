import { createPaginator } from "@smithy/core";
import { DescribeEventSubscriptionsCommand, } from "../commands/DescribeEventSubscriptionsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeEventSubscriptions = createPaginator(RDSClient, DescribeEventSubscriptionsCommand, "Marker", "Marker", "MaxRecords");
