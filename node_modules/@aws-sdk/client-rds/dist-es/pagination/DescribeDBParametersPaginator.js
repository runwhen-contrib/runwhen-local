import { createPaginator } from "@smithy/core";
import { DescribeDBParametersCommand, } from "../commands/DescribeDBParametersCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBParameters = createPaginator(RDSClient, DescribeDBParametersCommand, "Marker", "Marker", "MaxRecords");
