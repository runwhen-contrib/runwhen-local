import { createPaginator } from "@smithy/core";
import { DescribePendingMaintenanceActionsCommand, } from "../commands/DescribePendingMaintenanceActionsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribePendingMaintenanceActions = createPaginator(RDSClient, DescribePendingMaintenanceActionsCommand, "Marker", "Marker", "MaxRecords");
