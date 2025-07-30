import { createPaginator } from "@smithy/core";
import { DescribeIntegrationsCommand, } from "../commands/DescribeIntegrationsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeIntegrations = createPaginator(RDSClient, DescribeIntegrationsCommand, "Marker", "Marker", "MaxRecords");
