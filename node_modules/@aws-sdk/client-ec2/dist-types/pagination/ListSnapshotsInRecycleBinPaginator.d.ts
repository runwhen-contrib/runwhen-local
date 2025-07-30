import { Paginator } from "@smithy/types";
import { ListSnapshotsInRecycleBinCommandInput, ListSnapshotsInRecycleBinCommandOutput } from "../commands/ListSnapshotsInRecycleBinCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListSnapshotsInRecycleBin: (config: EC2PaginationConfiguration, input: ListSnapshotsInRecycleBinCommandInput, ...rest: any[]) => Paginator<ListSnapshotsInRecycleBinCommandOutput>;
