import { Paginator } from "@smithy/types";
import {
  DescribePendingMaintenanceActionsCommandInput,
  DescribePendingMaintenanceActionsCommandOutput,
} from "../commands/DescribePendingMaintenanceActionsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribePendingMaintenanceActions: (
  config: RDSPaginationConfiguration,
  input: DescribePendingMaintenanceActionsCommandInput,
  ...rest: any[]
) => Paginator<DescribePendingMaintenanceActionsCommandOutput>;
