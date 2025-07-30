import { createPaginator } from "@smithy/core";
import { DescribeEventsCommand, } from "../commands/DescribeEventsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeEvents = createPaginator(RDSClient, DescribeEventsCommand, "Marker", "Marker", "MaxRecords");
