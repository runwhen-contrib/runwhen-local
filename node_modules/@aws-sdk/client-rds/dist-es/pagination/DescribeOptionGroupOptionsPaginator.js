import { createPaginator } from "@smithy/core";
import { DescribeOptionGroupOptionsCommand, } from "../commands/DescribeOptionGroupOptionsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeOptionGroupOptions = createPaginator(RDSClient, DescribeOptionGroupOptionsCommand, "Marker", "Marker", "MaxRecords");
