import { createPaginator } from "@smithy/core";
import { DescribeDBRecommendationsCommand, } from "../commands/DescribeDBRecommendationsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBRecommendations = createPaginator(RDSClient, DescribeDBRecommendationsCommand, "Marker", "Marker", "MaxRecords");
