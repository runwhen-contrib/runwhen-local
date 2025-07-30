import { createPaginator } from "@smithy/core";
import { DescribeBlueGreenDeploymentsCommand, } from "../commands/DescribeBlueGreenDeploymentsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeBlueGreenDeployments = createPaginator(RDSClient, DescribeBlueGreenDeploymentsCommand, "Marker", "Marker", "MaxRecords");
